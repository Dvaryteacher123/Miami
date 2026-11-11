'use strict';

/**
 * YouTube helper (yt-dlp) used by .play / .ytmp3
 *  - finds a working yt-dlp binary, or downloads the standalone one (no Python needed)
 *  - tries several YouTube player clients (one of them usually works)
 *  - supports cookies (YT_COOKIES_FILE or data/cookies.txt) for servers YouTube blocks
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const https = require('https');
const { execFile } = require('child_process');

let FFMPEG = 'ffmpeg';
try { FFMPEG = require('ffmpeg-static') || 'ffmpeg'; } catch (_) {}

const DATA_BIN = path.join(__dirname, '..', 'data', 'bin');
const LOCAL_BIN = path.join(DATA_BIN, process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');

let resolved = null;
let resolving = null;

function exec(bin, args, timeout = 120000) {
    return new Promise((resolve, reject) => {
        execFile(bin, args, { timeout, maxBuffer: 1024 * 1024 * 30 }, (err, stdout, stderr) => {
            if (err) {
                err.stderr = String(stderr || '');
                return reject(err);
            }
            resolve(String(stdout || ''));
        });
    });
}

async function works(bin) {
    try {
        await exec(bin, ['--version'], 15000);
        return true;
    } catch (_) {
        return false;
    }
}

function download(url, dest, redirects = 6) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'phonephix-bot' } }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirects > 0) {
                res.resume();
                return resolve(download(res.headers.location, dest, redirects - 1));
            }
            if (res.statusCode !== 200) {
                res.resume();
                return reject(new Error('Download failed: HTTP ' + res.statusCode));
            }
            const tmp = dest + '.part';
            const out = fs.createWriteStream(tmp);
            res.pipe(out);
            out.on('finish', () => out.close(() => { fs.renameSync(tmp, dest); resolve(); }));
            out.on('error', reject);
        }).on('error', reject);
    });
}

async function findBinary() {
    const candidates = [process.env.YTDLP_PATH, LOCAL_BIN];
    try { candidates.push(require('youtube-dl-exec/src/constants').YOUTUBE_DL_PATH); } catch (_) {}
    candidates.push('yt-dlp');

    for (const c of candidates) {
        if (!c) continue;
        if (c !== 'yt-dlp' && !fs.existsSync(c)) continue;
        if (await works(c)) return c;
    }

    // Not found -> download the standalone build
    const asset =
        process.platform === 'win32' ? 'yt-dlp.exe' :
        process.platform === 'darwin' ? 'yt-dlp_macos' :
        process.arch === 'arm64' ? 'yt-dlp_linux_aarch64' : 'yt-dlp_linux';

    fs.mkdirSync(DATA_BIN, { recursive: true });
    await download('https://github.com/yt-dlp/yt-dlp/releases/latest/download/' + asset, LOCAL_BIN);
    try { fs.chmodSync(LOCAL_BIN, 0o755); } catch (_) {}
    if (await works(LOCAL_BIN)) return LOCAL_BIN;

    throw new Error('yt-dlp is not installed and could not be downloaded.');
}

async function ensureBinary() {
    if (resolved) return resolved;
    if (!resolving) {
        resolving = findBinary()
            .then((b) => { resolved = b; return b; })
            .finally(() => { resolving = null; });
    }
    return resolving;
}

function cookiesArgs() {
    const file = process.env.YT_COOKIES_FILE || path.join(__dirname, '..', 'data', 'cookies.txt');
    return file && fs.existsSync(file) ? ['--cookies', file] : [];
}

function hasCookies() {
    return cookiesArgs().length > 0;
}

function proxyArgs() {
    return process.env.YT_PROXY ? ['--proxy', process.env.YT_PROXY] : [];
}

const CLIENTS = (process.env.YT_CLIENTS || 'android,ios,tv,web_safari,mweb')
    .split(',').map((s) => s.trim()).filter(Boolean);

/** Turn a raw yt-dlp error into something a user (and the owner) can act on */
function explain(error) {
    const raw = String((error && (error.stderr || error.message)) || error || '');
    if (/Sign in to confirm|not a bot|cookies/i.test(raw)) {
        return { code: 'blocked', text: 'YouTube is blocking this server right now.' };
    }
    if (/Private video/i.test(raw)) return { code: 'private', text: 'This video is private.' };
    if (/Video unavailable|not available/i.test(raw)) return { code: 'unavailable', text: 'This video is unavailable.' };
    if (/age/i.test(raw) && /restrict|confirm/i.test(raw)) return { code: 'age', text: 'This video is age-restricted.' };
    if (/ENOENT|not installed|could not be downloaded/i.test(raw)) return { code: 'nobinary', text: 'The YouTube downloader is not available on this server.' };
    if (/timed out|ETIMEDOUT|Timeout/i.test(raw)) return { code: 'timeout', text: 'YouTube took too long to respond.' };
    return { code: 'other', text: raw.split('\n').filter(Boolean).slice(-1)[0]?.slice(0, 200) || 'Unknown error.' };
}

async function search(query) {
    const bin = await ensureBinary();
    const isUrl = /^https?:\/\//i.test(query);
    const target = isUrl ? query : 'ytsearch1:' + query;
    let lastErr;

    for (const client of [null, ...CLIENTS.slice(0, 2)]) {
        try {
            const args = ['--dump-single-json', '--no-warnings', '--no-playlist', ...(isUrl ? [] : ['--flat-playlist']),
                ...proxyArgs(), ...cookiesArgs()];
            if (client) args.push('--extractor-args', 'youtube:player_client=' + client);
            args.push(target);
            const out = await exec(bin, args, 45000);
            const info = JSON.parse(out);
            const v = info.entries && info.entries.length ? info.entries[0] : info;
            if (!v) throw new Error('Nothing was found.');
            const url = v.webpage_url || v.original_url || (v.id ? 'https://www.youtube.com/watch?v=' + v.id : v.url);
            if (!url) throw new Error('Nothing was found.');
            return { title: String(v.title || query), url, duration: Number(v.duration) || 0, uploader: v.uploader || v.channel || '' };
        } catch (e) {
            lastErr = e;
            if (/Nothing was found/.test(e.message)) break;
        }
    }
    throw lastErr || new Error('Nothing was found.');
}

/** Download audio as mp3 to <base>.mp3, trying each player client */
async function downloadAudio(url, base) {
    const bin = await ensureBinary();
    let lastErr;

    for (const client of CLIENTS) {
        try {
            const args = [
                '-f', 'bestaudio[ext=m4a]/bestaudio/best',
                '-x', '--audio-format', 'mp3', '--audio-quality', '5',
                '--no-playlist', '--no-warnings', '--quiet',
                '--max-filesize', '60M',
                '--retries', '2', '--socket-timeout', '30',
                '--ffmpeg-location', FFMPEG,
                '--extractor-args', 'youtube:player_client=' + client,
                ...proxyArgs(), ...cookiesArgs(),
                '-o', base + '.%(ext)s',
                url
            ];
            await exec(bin, args, 240000);

            const file = fs.readdirSync(os.tmpdir()).find((f) => f.startsWith(path.basename(base)) && f.endsWith('.mp3'));
            if (file) return path.join(os.tmpdir(), file);
            throw new Error('Download produced no file.');
        } catch (e) {
            lastErr = e;
            const code = explain(e).code;
            if (['private', 'unavailable', 'nobinary'].includes(code)) break;
        }
    }
    throw lastErr || new Error('Download failed.');
}

/** SoundCloud (via yt-dlp): search + download audio as mp3 to <base>.mp3 */
async function soundcloud(query, base, { probeOnly = false } = {}) {
    const bin = await ensureBinary();
    const target = /^https?:\/\//i.test(query) ? query : 'scsearch1:' + query;

    if (probeOnly) {
        const out = await exec(bin, ['--dump-single-json', '--flat-playlist', '--no-warnings', ...proxyArgs(), target], 40000);
        const info = JSON.parse(out);
        const v = info.entries && info.entries.length ? info.entries[0] : info;
        if (!v) { const e = new Error('Nothing was found.'); e.notFound = true; throw e; }
        return { title: String(v.title || query) };
    }

    const meta = JSON.parse(await exec(bin, ['--dump-single-json', '--no-warnings', '--no-playlist', ...proxyArgs(), target], 60000));
    const v = meta.entries && meta.entries.length ? meta.entries[0] : meta;
    if (!v) { const e = new Error('Nothing was found.'); e.notFound = true; throw e; }

    await exec(bin, [
        '-f', 'bestaudio/best', '-x', '--audio-format', 'mp3', '--audio-quality', '5',
        '--no-playlist', '--no-warnings', '--quiet', '--max-filesize', '60M',
        '--ffmpeg-location', FFMPEG, ...proxyArgs(),
        '-o', base + '.%(ext)s', v.webpage_url || v.url || target
    ], 180000);

    const file = fs.readdirSync(os.tmpdir()).find((f) => f.startsWith(path.basename(base)) && f.endsWith('.mp3'));
    if (!file) throw new Error('Download produced no file.');
    return { title: String(v.title || query), artist: v.uploader || '', duration: Number(v.duration) || 0, file: path.join(os.tmpdir(), file) };
}

module.exports = { ensureBinary, search, downloadAudio, soundcloud, explain, hasCookies, FFMPEG };
