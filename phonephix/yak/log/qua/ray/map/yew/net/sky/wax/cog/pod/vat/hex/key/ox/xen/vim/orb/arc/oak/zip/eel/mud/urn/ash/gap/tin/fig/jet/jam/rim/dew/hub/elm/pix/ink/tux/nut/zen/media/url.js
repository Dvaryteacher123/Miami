'use strict';

/**
 * .url  - reply to an image, video, audio, sticker or document to get a public link.
 * Uploads to several free hosts at once and returns every link that worked.
 */

const axios = require('axios');
const FormData = require('form-data');
const { downloadContentFromMessage } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../bot/baileys').get();

const MAX_MB = Number(process.env.URL_MAX_MB) || 100;

// the media kinds WhatsApp can send, with the matching download type
const KINDS = [
    ['imageMessage', 'image'],
    ['videoMessage', 'video'],
    ['audioMessage', 'audio'],
    ['stickerMessage', 'sticker'],
    ['documentMessage', 'document']
];

function unwrap(message) {
    let m = message;
    for (let i = 0; i < 5 && m; i++) {
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

function findMedia(quoted) {
    const m = unwrap(quoted) || {};
    for (const [key, type] of KINDS) {
        if (m[key]) return { node: m[key], type, key };
    }
    return null;
}

async function download(node, type) {
    const stream = await downloadContentFromMessage(node, type);
    const chunks = [];
    for await (const c of stream) chunks.push(c);
    return Buffer.concat(chunks);
}

function extFrom(mime = '', fallback = 'bin') {
    const map = {
        'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
        'video/mp4': 'mp4', 'video/3gpp': '3gp', 'audio/ogg': 'ogg', 'audio/mpeg': 'mp3',
        'audio/mp4': 'm4a', 'application/pdf': 'pdf', 'application/zip': 'zip'
    };
    return map[String(mime).split(';')[0]] || fallback;
}

const HEADERS = { 'User-Agent': 'Mozilla/5.0 PHONEPHIX-BOT' };

/* ---------------- uploaders: each returns a https url or throws ---------------- */

async function toCatbox(buffer, filename, mime) {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, { filename, contentType: mime });
    const { data } = await axios.post('https://catbox.moe/user/api.php', form, {
        headers: { ...form.getHeaders(), ...HEADERS }, timeout: 120000,
        maxContentLength: Infinity, maxBodyLength: Infinity
    });
    const url = String(data || '').trim();
    if (!/^https:\/\/files\.catbox\.moe\//.test(url)) throw new Error('catbox: ' + url.slice(0, 120));
    return url;
}

async function toUguu(buffer, filename, mime) {
    const form = new FormData();
    form.append('files[]', buffer, { filename, contentType: mime });
    const { data } = await axios.post('https://uguu.se/upload', form, {
        headers: { ...form.getHeaders(), ...HEADERS }, timeout: 120000,
        maxContentLength: Infinity, maxBodyLength: Infinity
    });
    const url = data?.files?.[0]?.url || (typeof data === 'string' ? data.trim() : '');
    if (!/^https:\/\//.test(url)) throw new Error('uguu: ' + JSON.stringify(data).slice(0, 120));
    return url;
}

async function toTelegraph(buffer, filename, mime) {
    const form = new FormData();
    form.append('file', buffer, { filename, contentType: mime });
    const { data } = await axios.post('https://telegra.ph/upload', form, {
        headers: { ...form.getHeaders(), ...HEADERS }, timeout: 60000
    });
    const src = Array.isArray(data) ? data[0]?.src : null;
    if (!src) throw new Error('telegraph: ' + JSON.stringify(data).slice(0, 120));
    return 'https://telegra.ph' + src;
}


async function toLitterbox(buffer, filename, mime) {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('time', '72h');
    form.append('fileToUpload', buffer, { filename, contentType: mime });
    const { data } = await axios.post('https://litterbox.catbox.moe/resources/internals/api.php', form, {
        headers: { ...form.getHeaders(), ...HEADERS }, timeout: 120000,
        maxContentLength: Infinity, maxBodyLength: Infinity
    });
    const url = String(data || '').trim();
    if (!/^https:\/\/litter\.catbox\.moe\//.test(url)) throw new Error('litterbox: ' + url.slice(0, 120));
    return url;
}

async function toTmpfiles(buffer, filename, mime) {
    const form = new FormData();
    form.append('file', buffer, { filename, contentType: mime });
    const { data } = await axios.post('https://tmpfiles.org/api/v1/upload', form, {
        headers: { ...form.getHeaders(), ...HEADERS }, timeout: 120000,
        maxContentLength: Infinity, maxBodyLength: Infinity
    });
    const u = data?.data?.url;
    if (data?.status !== 'success' || !u) throw new Error('tmpfiles: ' + JSON.stringify(data).slice(0, 120));
    // the normal page link is tmpfiles.org/ID/name; the direct download link adds /dl/
    return u.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
}

async function toPixeldrain(buffer, filename, mime) {
    const { data } = await axios.put('https://pixeldrain.com/api/file/' + encodeURIComponent(filename), buffer, {
        headers: { 'Content-Type': mime, ...HEADERS }, timeout: 120000,
        maxContentLength: Infinity, maxBodyLength: Infinity
    });
    if (!data?.id) throw new Error('pixeldrain: ' + JSON.stringify(data).slice(0, 120));
    return 'https://pixeldrain.com/u/' + data.id;
}

async function to0x0(buffer, filename, mime) {
    const form = new FormData();
    form.append('file', buffer, { filename, contentType: mime });
    const { data } = await axios.post('https://0x0.st', form, {
        headers: { ...form.getHeaders(), ...HEADERS }, timeout: 120000,
        maxContentLength: Infinity, maxBodyLength: Infinity
    });
    const url = String(data || '').trim();
    if (!/^https:\/\/0x0\.st\//.test(url)) throw new Error('0x0: ' + url.slice(0, 120));
    return url;
}

/* Every host is tried AT THE SAME TIME. You get back every link that worked. */
async function upload(buffer, filename, mime, isImage) {
    const hosts = [
        ['catbox', toCatbox],
        ['uguu', toUguu],
        ['litterbox', toLitterbox],
        ['tmpfiles', toTmpfiles],
        ['pixeldrain', toPixeldrain],
        ['0x0', to0x0]
    ];
    if (isImage) hosts.push(['telegraph', toTelegraph]);

    const results = await Promise.allSettled(
        hosts.map(([, fn]) => fn(buffer, filename, mime))
    );

    const links = [];
    const errors = [];
    results.forEach((r, i) => {
        const name = hosts[i][0];
        if (r.status === 'fulfilled') links.push({ host: name, url: r.value });
        else { errors.push(name); console.error('[URL] ' + name + ' failed:', r.reason && r.reason.message); }
    });

    if (!links.length) throw new Error('all hosts failed: ' + errors.join(', '));
    return { links, failed: errors };
}

module.exports = {
    name: 'url',
    category: 'media',
    aliases: ['tourl', 'imgurl', 'geturl', 'link'],
    description: 'Reply to an image, video, audio or file to get a public link',
    usage: '.url (reply to a media file)',
    emoji: '🔗',
    ownerOnly: false,
    cooldown: 5,

    async execute(ctx) {
        const { sock, msg, from, prefix = '.' } = ctx;
        const reply = (text) => sock.sendMessage(from, { text: String(text) }, { quoted: msg });

        try {
            const context =
                msg?.message?.extendedTextMessage?.contextInfo ||
                msg?.message?.imageMessage?.contextInfo ||
                msg?.message?.videoMessage?.contextInfo ||
                msg?.message?.documentMessage?.contextInfo;

            const quoted = context?.quotedMessage;
            if (!quoted) {
                return reply(`🔗 *GET LINK*\n\nReply to an image, video, audio or file with *${prefix}url*.`);
            }

            const found = findMedia(quoted);
            if (!found) {
                return reply(`❌ *No media found.*\n\nReply directly to an image, video, audio or file.`);
            }

            const declared = Number(found.node.fileLength || 0);
            if (declared && declared > MAX_MB * 1024 * 1024) {
                return reply(`❌ File is too big. The limit is ${MAX_MB} MB.`);
            }

            await reply('⏳ *Downloading...*');
            const buffer = await download(found.node, found.type);
            if (!buffer.length) return reply('❌ Could not download this file. Ask the sender to send it again.');

            const mime = found.node.mimetype || 'application/octet-stream';
            const name = found.node.fileName || `phonephix.${extFrom(mime, found.type === 'image' ? 'jpg' : 'bin')}`;
            const isImage = found.type === 'image' || found.type === 'sticker';

            await reply('☁️ *Uploading...*');
            const { links, failed } = await upload(buffer, name, mime, isImage);

            const lines = links.map((l) => `🔗 *${l.host}*\n${l.url}`).join('\n\n');
            return reply(
                `✅ *FILE LINKS* (${links.length} hosts)\n\n${lines}\n\n` +
                `📦 Size: ${(buffer.length / 1048576).toFixed(2)} MB\n` +
                (failed.length ? `⚠️ Not available right now: ${failed.join(', ')}\n` : '') +
                `━━━━━━━━━━━━━━━━\n🚀 *PHONEPHIX BOT*`
            );
        } catch (error) {
            console.error('[URL COMMAND ERROR]', error && error.message ? error.message : error);
            return reply(`❌ *Upload failed.* All hosts refused this file. Try a smaller file, or again in a minute.`);
        }
    }
};

