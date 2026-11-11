'use strict';

/**
 * =====================================================
 *  PHONEPHIX BOT - MEDIA KIT
 *  Helpers for the media commands (audio / image / video).
 *
 *  - NO "please wait" messages (only a typing/recording presence)
 *  - ffmpeg jobs run through a small limiter so 700 users can't
 *    freeze the VPS or the WhatsApp connections
 *  - everything runs locally (ffmpeg + sharp), no external API
 * =====================================================
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFile } = require('child_process');

let FFMPEG = 'ffmpeg';
try {
    FFMPEG = require('ffmpeg-static') || 'ffmpeg';
} catch (_) { /* use system ffmpeg */ }

const MAX_INPUT_BYTES = (Number(process.env.MEDIA_MAX_INPUT_MB) || 40) * 1024 * 1024;
const FFMPEG_TIMEOUT_MS = Number(process.env.FFMPEG_TIMEOUT_MS) || 120000;
const MAX_JOBS = Math.max(1, Number(process.env.FFMPEG_CONCURRENCY) || 2);
const MAX_WAITING = Number(process.env.FFMPEG_MAX_WAITING) || 40;

/* ------------------------------------------------------------------
 * Tiny limiter: at most MAX_JOBS ffmpeg processes at the same time
 * ------------------------------------------------------------------ */
let running = 0;
const waiting = [];

function acquire() {
    return new Promise((resolve, reject) => {
        if (running < MAX_JOBS) {
            running += 1;
            return resolve();
        }
        if (waiting.length >= MAX_WAITING) {
            return reject(new Error('Server is busy, try again in a moment.'));
        }
        waiting.push(resolve);
    });
}

function release() {
    const next = waiting.shift();
    if (next) next();
    else running -= 1;
}

/* ------------------------------------------------------------------
 * Find media inside the message (or the replied message)
 * ------------------------------------------------------------------ */
function unwrap(message) {
    let m = message || {};
    for (let i = 0; i < 4; i += 1) {
        const inner =
            m.ephemeralMessage?.message ||
            m.viewOnceMessage?.message ||
            m.viewOnceMessageV2?.message ||
            m.viewOnceMessageV2Extension?.message ||
            m.documentWithCaptionMessage?.message;
        if (!inner) break;
        m = inner;
    }
    return m;
}

function findMedia(ctx, keys) {
    const { msg, from } = ctx;
    const own = unwrap(msg.message);

    for (const key of keys) {
        if (own[key]) return { key, target: msg };
    }

    const info =
        own.extendedTextMessage?.contextInfo ||
        own.imageMessage?.contextInfo ||
        own.videoMessage?.contextInfo ||
        own.audioMessage?.contextInfo ||
        null;

    const quoted = info?.quotedMessage ? unwrap(info.quotedMessage) : null;

    if (quoted) {
        for (const key of keys) {
            if (quoted[key]) {
                return {
                    key,
                    target: {
                        key: {
                            remoteJid: from,
                            id: info.stanzaId,
                            participant: info.participant
                        },
                        message: quoted
                    }
                };
            }
        }
    }

    return null;
}

async function download(ctx, found) {
    const { downloadMediaMessage } = require('../bot/baileys').get();

    const node = unwrap(found.target.message)[found.key];
    const size = Number(node?.fileLength?.low ?? node?.fileLength) || 0;

    if (size && size > MAX_INPUT_BYTES) {
        throw new Error(`File too large (max ${Math.round(MAX_INPUT_BYTES / 1048576)}MB).`);
    }

    const buffer = await downloadMediaMessage(
        found.target,
        'buffer',
        {},
        {
            logger: { info() {}, error() {}, warn() {}, debug() {}, trace() {}, child() { return this; } },
            reuploadRequest: ctx.sock.updateMediaMessage
        }
    );

    if (!buffer || !buffer.length) throw new Error('Could not download the media.');
    if (buffer.length > MAX_INPUT_BYTES) {
        throw new Error(`File too large (max ${Math.round(MAX_INPUT_BYTES / 1048576)}MB).`);
    }
    return buffer;
}

/* ------------------------------------------------------------------
 * ffmpeg runner
 * ------------------------------------------------------------------ */
function tmpFile(ext) {
    return path.join(os.tmpdir(), `dv_${crypto.randomBytes(8).toString('hex')}.${ext}`);
}

function safeUnlink(f) {
    fs.promises.unlink(f).catch(() => {});
}

/**
 * runFfmpeg(buffer, { inExt, outExt, pre: [...], args: [...] })
 *   pre  -> options placed BEFORE -i (e.g. ['-ss','3'])
 *   args -> options placed AFTER  -i (filters, codecs)
 */
async function runFfmpeg(buffer, { inExt = 'bin', outExt = 'mp3', pre = [], args = [] } = {}) {
    const input = tmpFile(inExt);
    const output = tmpFile(outExt);

    await acquire();

    try {
        await fs.promises.writeFile(input, buffer);

        await new Promise((resolve, reject) => {
            execFile(
                FFMPEG,
                ['-y', '-hide_banner', '-loglevel', 'error', ...pre, '-i', input, ...args, output],
                { timeout: FFMPEG_TIMEOUT_MS, maxBuffer: 1024 * 1024 * 4 },
                (err, _out, stderr) => {
                    if (err) {
                        const detail = String(stderr || err.message || '').split('\n').filter(Boolean).slice(-2).join(' ');
                        return reject(new Error(`Processing failed. ${detail}`.trim().slice(0, 300)));
                    }
                    resolve();
                }
            );
        });

        const out = await fs.promises.readFile(output);
        if (!out.length) throw new Error('Processing produced an empty file.');
        return out;
    } finally {
        safeUnlink(input);
        safeUnlink(output);
        release();
    }
}

/* ------------------------------------------------------------------
 * Small parsers
 * ------------------------------------------------------------------ */
function num(value, def, min, max) {
    const n = parseFloat(String(value === undefined ? '' : value).replace(',', '.'));
    if (!Number.isFinite(n)) return def;
    return Math.min(max, Math.max(min, n));
}

/** atempo only accepts 0.5 - 2.0, so chain filters for other values */
function atempoChain(rate) {
    const parts = [];
    let r = rate;
    while (r > 2.0) { parts.push('atempo=2.0'); r /= 2.0; }
    while (r < 0.5) { parts.push('atempo=0.5'); r /= 0.5; }
    parts.push(`atempo=${r.toFixed(4)}`);
    return parts.join(',');
}

/* ------------------------------------------------------------------
 * Command factory
 *
 * defineMedia({
 *   name, aliases, description, usage,
 *   input: 'audio' | 'image' | 'video' | 'sticker' | 'audiovideo',
 *   run: async ({ buffer, args, ctx, found }) => result
 * })
 *
 * result = { audio|image|video|sticker|text: ..., caption?, ptt?, gif? }
 * ------------------------------------------------------------------ */
const INPUT_KEYS = {
    audio: ['audioMessage', 'videoMessage'],
    image: ['imageMessage', 'stickerMessage'],
    video: ['videoMessage'],
    sticker: ['stickerMessage'],
    imageonly: ['imageMessage']
};

const INPUT_HELP = {
    audio: 'an audio / voice note / video',
    image: 'an image or sticker',
    video: 'a video or GIF',
    sticker: 'a sticker',
    imageonly: 'an image'
};

function defineMedia(def) {
    const keys = INPUT_KEYS[def.input] || INPUT_KEYS.audio;

    return {
        name: def.name,
        aliases: def.aliases || [],
        category: 'media',
        description: def.description || '',
        usage: `.${def.usage || def.name}`,
        ownerOnly: false,
        groupOnly: false,
        privateOnly: false,
        adminOnly: false,
        botAdminOnly: false,
        // the bot-wide anti-flood already protects the server; no per-user "wait"
        cooldown: 0,

        async execute(ctx) {
            const { sock, msg, from } = ctx;
            const prefix = ctx.prefix || '.';
            const say = (text) => sock.sendMessage(from, { text }, { quoted: msg });

            try {
                const found = findMedia(ctx, keys);

                if (!found) {
                    return await say(
                        `❌ Reply to ${INPUT_HELP[def.input] || 'a media file'} with *${prefix}${def.usage || def.name}*`
                    );
                }

                // typing / recording indicator instead of a "wait" message
                sock.sendPresenceUpdate(
                    def.input === 'audio' ? 'recording' : 'composing',
                    from
                ).catch(() => {});

                const buffer = await download(ctx, found);
                const args = Array.isArray(ctx.args) ? ctx.args : [];
                const result = await def.run({ buffer, args, ctx, found, prefix });

                if (!result) return;

                const opts = { quoted: msg };

                if (result.text) return await sock.sendMessage(from, { text: result.text }, opts);
                if (result.audio) {
                    return await sock.sendMessage(
                        from,
                        {
                            audio: result.audio,
                            mimetype: result.ptt ? 'audio/ogg; codecs=opus' : 'audio/mpeg',
                            ptt: !!result.ptt
                        },
                        opts
                    );
                }
                if (result.video) {
                    return await sock.sendMessage(
                        from,
                        {
                            video: result.video,
                            mimetype: 'video/mp4',
                            caption: result.caption || '',
                            gifPlayback: !!result.gif
                        },
                        opts
                    );
                }
                if (result.image) {
                    return await sock.sendMessage(
                        from,
                        { image: result.image, caption: result.caption || '' },
                        opts
                    );
                }
                if (result.sticker) {
                    return await sock.sendMessage(from, { sticker: result.sticker }, opts);
                }
            } catch (error) {
                return say(`❌ ${String(error && error.message ? error.message : 'Something went wrong').slice(0, 300)}`).catch(() => {});
            }
        }
    };
}

/** audio filter command (-af) -> mp3 */
function audioFx(name, filter, extra = {}) {
    return defineMedia({
        name,
        aliases: extra.aliases,
        description: extra.description,
        usage: extra.usage,
        input: 'audio',
        run: async ({ buffer, args }) => {
            const af = typeof filter === 'function' ? filter(args) : filter;
            const out = await runFfmpeg(buffer, {
                outExt: 'mp3',
                pre: extra.limit ? ['-t', String(extra.limit)] : [],
                args: ['-vn', '-af', af, '-c:a', 'libmp3lame', '-b:a', '128k']
            });
            return { audio: out };
        }
    });
}

/** video filter command (-vf / -af) -> mp4 */
function buildVideoArgs(c, withAudio) {
    const a = [];
    const even = 'scale=trunc(iw/2)*2:trunc(ih/2)*2';

    if (c.filterComplex) {
        a.push('-filter_complex', c.filterComplex, ...(c.map || []));
    } else {
        a.push('-vf', c.vf ? `${even},${c.vf}` : even);
    }

    if (withAudio && c.af && !c.noAudio) a.push('-af', c.af);
    if (!withAudio || c.noAudio) a.push('-an');

    a.push(
        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', String(c.crf || 26),
        '-pix_fmt', 'yuv420p', '-movflags', '+faststart'
    );
    if (withAudio && !c.noAudio) a.push('-c:a', 'aac', '-b:a', '96k');
    return a;
}

async function processVideo(buffer, c) {
    const pre = [...(c.pre || []), ...(c.limit ? ['-t', String(c.limit)] : [])];
    try {
        return await runFfmpeg(buffer, { inExt: 'mp4', outExt: 'mp4', pre, args: buildVideoArgs(c, true) });
    } catch (err) {
        // GIFs / videos without an audio track: retry without audio
        if (c.noAudio) throw err;
        return runFfmpeg(buffer, { inExt: 'mp4', outExt: 'mp4', pre, args: buildVideoArgs(c, false) });
    }
}

function videoFx(name, cfg, extra = {}) {
    return defineMedia({
        name,
        aliases: extra.aliases,
        description: extra.description,
        usage: extra.usage,
        input: 'video',
        run: async ({ buffer, args }) => {
            const c = typeof cfg === 'function' ? cfg(args) : cfg;
            const out = await processVideo(buffer, c);
            return { video: out, gif: !!c.gif };
        }
    });
}

/** image command using sharp: fn(sharpInstance, args, meta) -> sharp pipeline */
function imageFx(name, fn, extra = {}) {
    return defineMedia({
        name,
        aliases: extra.aliases,
        description: extra.description,
        usage: extra.usage,
        input: 'image',
        run: async ({ buffer, args }) => {
            const sharp = require('sharp');
            const meta = await sharp(buffer).metadata();
            let img = sharp(buffer, { animated: false });
            img = await fn(img, args, meta, sharp);
            const out = extra.png
                ? await img.png().toBuffer()
                : await img.jpeg({ quality: 90 }).toBuffer();
            return { image: out, caption: extra.caption || '' };
        }
    });
}

module.exports = {
    FFMPEG,
    acquire,
    release,
    processVideo,
    defineMedia,
    audioFx,
    videoFx,
    imageFx,
    runFfmpeg,
    findMedia,
    download,
    unwrap,
    num,
    atempoChain
};
