'use strict';

/**
 * =====================================================
 *  MUSIC KIT - many free sources, tried one after another
 * =====================================================
 *  saavn       JioSaavn public API  (full songs, no key, no YouTube)
 *  piped       YouTube audio through public Piped servers (works when YouTube blocks you)
 *  community   free community download APIs (edit data/music-apis.json)
 *  soundcloud  SoundCloud via yt-dlp
 *  youtube     YouTube via yt-dlp   (needs cookies on blocked servers)
 *  audius      Audius public API    (full songs, free)
 *  deezer      Deezer public API    (30-second PREVIEW only, last resort)
 *
 *  Order: MUSIC_PROVIDERS in .env  (default: saavn,soundcloud,youtube,audius,deezer)
 *  A source that fails because the server is blocked is skipped for a few minutes.
 * =====================================================
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const yt = require('./ytKit');

const UA = 'Mozilla/5.0 (compatible; PhonephixBot/1.0)';
const MAX_BYTES = 60 * 1024 * 1024;

const SAAVN_BASES = (process.env.SAAVN_API_URLS ||
    'https://saavn.dev/api,https://jiosaavn-api-privatecvc2.vercel.app')
    .split(',').map((s) => s.trim().replace(/\/+$/, '')).filter(Boolean);

/* ---------------- http helpers ---------------- */

async function http(url, { timeout = 15000, json = true } = {}) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), timeout);
    try {
        const res = await fetch(url, { signal: ctl.signal, headers: { 'User-Agent': UA, Accept: '*/*' }, redirect: 'follow' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return json ? await res.json() : res;
    } catch (e) {
        if (e.name === 'AbortError') throw new Error('Timed out');
        throw e;
    } finally {
        clearTimeout(t);
    }
}

async function getBuffer(url, timeout = 90000) {
    const res = await http(url, { timeout, json: false });
    const len = Number(res.headers.get('content-length')) || 0;
    if (len > MAX_BYTES) throw new Error('File is too large for WhatsApp.');
    const buf = Buffer.from(await res.arrayBuffer());
    if (!buf.length) throw new Error('Empty audio file.');
    if (buf.length > MAX_BYTES) throw new Error('File is too large for WhatsApp.');
    const type = String(res.headers.get('content-type') || '');
    return { buffer: buf, type };
}

const notFound = (m = 'Nothing was found.') => Object.assign(new Error(m), { notFound: true });
const clean = (s) => String(s || '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#039;/g, "'").trim();

function mimeFor(url, type) {
    if (/mpeg|mp3/i.test(type) || /\.mp3(\?|$)/i.test(url)) return { mime: 'audio/mpeg', ext: 'mp3' };
    if (/mp4|m4a|aac/i.test(type) || /\.(mp4|m4a)(\?|$)/i.test(url)) return { mime: 'audio/mp4', ext: 'm4a' };
    if (/ogg|opus/i.test(type)) return { mime: 'audio/ogg; codecs=opus', ext: 'ogg' };
    return { mime: 'audio/mpeg', ext: 'mp3' };
}

/* ---------------- providers ---------------- */

/** JioSaavn: tolerant of the common response shapes */
function saavnPick(json) {
    const list = json?.data?.results || json?.results || (Array.isArray(json) ? json : []);
    const s = list[0];
    if (!s) throw notFound();

    let urls = s.downloadUrl || s.download_url || [];
    let url = null;
    if (Array.isArray(urls) && urls.length) {
        const best = urls[urls.length - 1];
        url = best.url || best.link || (typeof best === 'string' ? best : null);
    } else if (typeof urls === 'string') {
        url = urls;
    }
    url = url || s.media_url || s.url;
    if (!url || !/^https?:/i.test(url)) throw notFound('No audio link in the result.');

    const artist = s.artists?.primary?.map((a) => a.name).join(', ') ||
        s.primaryArtists || s.singers || s.artist || '';
    return {
        title: clean(s.name || s.title || s.song),
        artist: clean(Array.isArray(artist) ? artist.join(', ') : artist),
        duration: Number(s.duration) || 0,
        url: url.replace(/^http:/i, 'https:')
    };
}

async function saavnFind(query) {
    let lastErr;
    for (const base of SAAVN_BASES) {
        try {
            const json = await http(`${base}/search/songs?query=${encodeURIComponent(query)}&limit=3`);
            return saavnPick(json);
        } catch (e) {
            lastErr = e;
            if (e.notFound) break;
        }
    }
    throw lastErr || notFound();
}

async function audiusHost() {
    const j = await http('https://api.audius.co', { timeout: 10000 });
    const hosts = Array.isArray(j?.data) ? j.data : [];
    if (!hosts.length) throw new Error('No Audius host available');
    return hosts[Math.floor(Math.random() * hosts.length)].replace(/\/+$/, '');
}

async function audiusFind(query) {
    const host = await audiusHost();
    const j = await http(`${host}/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=PHONEPHIX-BOT`);
    const t = (j?.data || [])[0];
    if (!t) throw notFound();
    return {
        title: clean(t.title),
        artist: clean(t.user?.name),
        duration: Number(t.duration) || 0,
        url: `${host}/v1/tracks/${t.id}/stream?app_name=PHONEPHIX-BOT`
    };
}

async function deezerFind(query) {
    const j = await http(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=3`);
    const t = (j?.data || []).find((x) => x.preview);
    if (!t) throw notFound();
    return { title: clean(t.title), artist: clean(t.artist?.name), duration: 30, url: t.preview, preview: true };
}

/* ---------------- YouTube search without yt-dlp ---------------- */

const PIPED_INSTANCES = (process.env.PIPED_INSTANCES ||
    'https://pipedapi.kavin.rocks,https://pipedapi.leptons.xyz,https://pipedapi.nosebs.ru,' +
    'https://pipedapi-libre.kavin.rocks,https://piped-api.privacy.com.de,https://pipedapi.adminforge.de,' +
    'https://api.piped.yt,https://pipedapi.drgns.space,https://pipedapi.owo.si,https://pipedapi.ducks.party,' +
    'https://piped-api.codespace.cz,https://pipedapi.reallyaweso.me,https://api.piped.private.coffee,' +
    'https://pipedapi.darkness.services,https://pipedapi.orangenet.cc')
    .split(',').map((s) => s.trim().replace(/\/+$/, '')).filter(Boolean);

const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);

/** Search YouTube by scraping the results page (one request, no API) */
async function ytScrape(query) {
    const res = await http(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&hl=en`,
        { timeout: 15000, json: false });
    const html = await res.text();
    const m = html.match(/"videoRenderer":\{"videoId":"([\w-]{11})"[\s\S]{0,1500}?"title":\{"runs":\[\{"text":"([^"]+)"/);
    if (!m) throw notFound();
    const owner = html.match(/"ownerText":\{"runs":\[\{"text":"([^"]+)"/);
    return { id: m[1], title: clean(m[2].replace(/\\u0026/g, '&')), artist: owner ? clean(owner[1]) : '' };
}

/** Search through Piped instances (fallback for the scraper) */
async function pipedSearch(query) {
    let lastErr;
    for (const base of shuffle(PIPED_INSTANCES).slice(0, 4)) {
        try {
            const j = await http(`${base}/search?q=${encodeURIComponent(query)}&filter=music_songs`, { timeout: 12000 });
            let it = (j?.items || []).find((x) => /watch\?v=/.test(x.url || ''));
            if (!it) {
                const j2 = await http(`${base}/search?q=${encodeURIComponent(query)}&filter=videos`, { timeout: 12000 });
                it = (j2?.items || []).find((x) => /watch\?v=/.test(x.url || ''));
            }
            if (!it) throw notFound();
            return { id: String(it.url).split('v=')[1].split('&')[0], title: clean(it.title), artist: clean(it.uploaderName), duration: Number(it.duration) || 0 };
        } catch (e) {
            lastErr = e;
            if (e.notFound) break;
        }
    }
    throw lastErr || notFound();
}

function ytId(text) {
    const m = String(text).match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/);
    return m ? m[1] : null;
}

async function ytFind(query) {
    const direct = ytId(query);
    if (direct) return { id: direct, title: query, artist: '' };
    try { return await ytScrape(query); } catch (e) { if (e.notFound) throw e; }
    return pipedSearch(query);
}

/** Piped: audio stream URLs served by a public instance (works where YouTube blocks the server) */
async function pipedFind(query) {
    const v = await ytFind(query);
    let lastErr;
    for (const base of shuffle(PIPED_INSTANCES).slice(0, 5)) {
        try {
            const j = await http(`${base}/streams/${v.id}`, { timeout: 15000 });
            const streams = (j?.audioStreams || []).filter((a) => a.url && !/webm|opus/i.test(a.mimeType || '') || (a.url && /mp4|m4a/i.test(a.mimeType || '')));
            const pool = streams.length ? streams : (j?.audioStreams || []).filter((a) => a.url);
            if (!pool.length) throw new Error('No audio stream');
            // prefer ~128kbps AAC to keep the file small
            pool.sort((a, b) => Math.abs((a.bitrate || 128000) - 128000) - Math.abs((b.bitrate || 128000) - 128000));
            const a = pool[0];
            return {
                title: clean(j.title || v.title), artist: clean(j.uploader || v.artist),
                duration: Number(j.duration) || 0, url: a.url, mimeHint: a.mimeType || ''
            };
        } catch (e) {
            lastErr = e;
        }
    }
    throw lastErr || new Error('No Piped instance responded.');
}

/* ---------------- community APIs (editable list) ---------------- */

const DEFAULT_COMMUNITY = [
    { name: 'siputzx', url: 'https://api.siputzx.my.id/api/d/ytmp3?url={url}' },
    { name: 'ryzendesu', url: 'https://api.ryzendesu.vip/api/downloader/ytmp3?url={url}' },
    { name: 'agatz', url: 'https://api.agatz.xyz/api/ytmp3?url={url}' }
];

function communityList() {
    try {
        const f = process.env.MUSIC_APIS_FILE || path.join(__dirname, '..', 'data', 'music-apis.json');
        if (fs.existsSync(f)) {
            const j = JSON.parse(fs.readFileSync(f, 'utf8'));
            if (Array.isArray(j) && j.length) return j.filter((x) => x && x.url);
        }
    } catch (_) {}
    return DEFAULT_COMMUNITY;
}

/** find the first audio-looking link inside any JSON shape */
function findLink(obj, depth = 0) {
    if (!obj || depth > 4) return null;
    if (typeof obj === 'string') return /^https?:\/\//i.test(obj) ? obj : null;
    const keys = ['dl', 'download', 'downloadUrl', 'download_url', 'link', 'url', 'audio', 'mp3', 'result', 'data'];
    if (Array.isArray(obj)) { for (const o of obj) { const r = findLink(o, depth + 1); if (r) return r; } return null; }
    for (const k of keys) {
        if (k in obj) { const r = findLink(obj[k], depth + 1); if (r) return r; }
    }
    return null;
}

async function communityFind(query) {
    const v = await ytFind(query);
    const ytUrl = 'https://www.youtube.com/watch?v=' + v.id;
    let lastErr;
    for (const api of communityList()) {
        try {
            const target = api.url.replace('{url}', encodeURIComponent(ytUrl)).replace('{query}', encodeURIComponent(query)).replace('{id}', v.id);
            const j = await http(target, { timeout: 40000 });
            const link = findLink(j);
            if (!link) throw new Error(api.name + ': no download link');
            return { title: clean(j?.data?.title || j?.title || v.title), artist: v.artist, duration: 0, url: link, via: api.name };
        } catch (e) {
            lastErr = e;
        }
    }
    throw lastErr || new Error('No community API responded.');
}

const PROVIDERS = {
    saavn: {
        label: 'JioSaavn',
        urlOnly: false,
        async get(query) {
            const t = await saavnFind(query);
            const { buffer, type } = await getBuffer(t.url);
            return { ...t, buffer, ...mimeFor(t.url, type) };
        },
        async probe(q) { return (await saavnFind(q)).title; }
    },
    piped: {
        label: 'YouTube (Piped)',
        async get(query) {
            const t = await pipedFind(query);
            const { buffer, type } = await getBuffer(t.url, 120000);
            return { ...t, buffer, ...mimeFor(t.url, type || t.mimeHint) };
        },
        async probe(q) { const t = await pipedFind(q); return t.title; }
    },
    community: {
        label: 'Community API',
        async get(query) {
            const t = await communityFind(query);
            const { buffer, type } = await getBuffer(t.url, 120000);
            return { ...t, buffer, label: 'API ' + t.via, ...mimeFor(t.url, type) };
        },
        async probe(q) { const t = await communityFind(q); return t.title + ' (' + t.via + ')'; }
    },
    audius: {
        label: 'Audius',
        async get(query) {
            const t = await audiusFind(query);
            const { buffer, type } = await getBuffer(t.url);
            return { ...t, buffer, ...mimeFor('x.mp3', type || 'audio/mpeg') };
        },
        async probe(q) { return (await audiusFind(q)).title; }
    },
    deezer: {
        label: 'Deezer (30s preview)',
        async get(query) {
            const t = await deezerFind(query);
            const { buffer } = await getBuffer(t.url);
            return { ...t, buffer, mime: 'audio/mpeg', ext: 'mp3' };
        },
        async probe(q) { return (await deezerFind(q)).title; }
    },
    soundcloud: {
        label: 'SoundCloud',
        async get(query) {
            const base = path.join(os.tmpdir(), 'dv_sc_' + crypto.randomBytes(6).toString('hex'));
            const r = await yt.soundcloud(query, base);
            try {
                const buffer = await fs.promises.readFile(r.file);
                if (buffer.length > MAX_BYTES) throw new Error('File is too large for WhatsApp.');
                return { title: r.title, artist: r.artist, duration: r.duration, buffer, mime: 'audio/mpeg', ext: 'mp3' };
            } finally {
                for (const f of fs.readdirSync(os.tmpdir())) {
                    if (f.startsWith(path.basename(base))) fs.unlink(path.join(os.tmpdir(), f), () => {});
                }
            }
        },
        async probe(q) { return (await yt.soundcloud(q, null, { probeOnly: true })).title; }
    },
    youtube: {
        label: 'YouTube',
        async get(query) {
            const base = path.join(os.tmpdir(), 'dv_yt_' + crypto.randomBytes(6).toString('hex'));
            try {
                const v = await yt.search(query);
                if (v.duration && v.duration > 20 * 60) throw Object.assign(new Error('Too long. Maximum is 20 minutes.'), { notFound: true });
                const file = await yt.downloadAudio(v.url, base);
                const buffer = await fs.promises.readFile(file);
                if (buffer.length > MAX_BYTES) throw new Error('File is too large for WhatsApp.');
                return { title: v.title, artist: v.uploader, duration: v.duration, buffer, mime: 'audio/mpeg', ext: 'mp3' };
            } finally {
                for (const f of fs.readdirSync(os.tmpdir())) {
                    if (f.startsWith(path.basename(base))) fs.unlink(path.join(os.tmpdir(), f), () => {});
                }
            }
        },
        async probe(q) { return (await yt.search(q)).title; }
    }
};

const ORDER = (process.env.MUSIC_PROVIDERS || 'saavn,piped,soundcloud,youtube,community,audius,deezer')
    .split(',').map((s) => s.trim().toLowerCase()).filter((s) => PROVIDERS[s]);

/* A source that is blocked/down is skipped for a while so the next song is fast */
const skipUntil = new Map();
const SKIP_MS = (Number(process.env.MUSIC_SKIP_MINUTES) || 5) * 60000;

function withTimeout(promise, ms, label) {
    let t;
    return Promise.race([
        promise,
        new Promise((_, rej) => { t = setTimeout(() => rej(new Error(label + ' timed out')), ms); })
    ]).finally(() => clearTimeout(t));
}

/**
 * fetchTrack(query) -> { title, artist, buffer, mime, ext, provider, preview }
 * Throws an Error with .attempts = [{ id, error }] when every source fails.
 */
async function fetchTrack(query, { isUrl = false } = {}) {
    const attempts = [];
    const ids = isUrl ? ['youtube'] : ORDER;

    for (const id of ids) {
        if ((skipUntil.get(id) || 0) > Date.now()) {
            attempts.push({ id, error: 'skipped (recently failed)' });
            continue;
        }
        try {
            const p = PROVIDERS[id];
            const r = await withTimeout(p.get(query), id === 'youtube' ? 120000 : 70000, p.label);
            if (!r || !r.buffer) throw new Error('No audio.');
            return { ...r, provider: id, label: p.label, preview: !!r.preview };
        } catch (e) {
            const msg = String((e && (e.stderr || e.message)) || e).split('\n').filter(Boolean).pop().slice(0, 160);
            attempts.push({ id, error: msg });
            if (!e.notFound) skipUntil.set(id, Date.now() + SKIP_MS);
        }
    }

    const err = new Error('No source could provide this song.');
    err.attempts = attempts;
    throw err;
}

/** For .songsearch: top results (title/artist) from Deezer, falling back to Saavn */
async function searchList(query, limit = 8) {
    try {
        const j = await http(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=${limit}`);
        const rows = (j?.data || []).map((t) => ({
            title: clean(t.title), artist: clean(t.artist?.name), album: clean(t.album?.title), duration: Number(t.duration) || 0
        }));
        if (rows.length) return rows;
    } catch (_) {}

    for (const base of SAAVN_BASES) {
        try {
            const j = await http(`${base}/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`);
            const list = j?.data?.results || j?.results || [];
            const rows = list.map((s) => ({
                title: clean(s.name || s.title),
                artist: clean(s.artists?.primary?.map((a) => a.name).join(', ') || s.primaryArtists || s.singers || ''),
                album: clean(s.album?.name || s.album || ''), duration: Number(s.duration) || 0
            }));
            if (rows.length) return rows;
        } catch (_) {}
    }
    return [];
}

/** Lyrics from LRCLIB (free, no key) */
async function lyrics(query) {
    const j = await http(`https://lrclib.net/api/search?q=${encodeURIComponent(query)}`);
    const hit = (Array.isArray(j) ? j : []).find((x) => x.plainLyrics);
    if (!hit) throw notFound('No lyrics found.');
    return { title: clean(hit.trackName), artist: clean(hit.artistName), text: String(hit.plainLyrics).trim() };
}

/** For .musiccheck: probe every provider */
async function diagnose(query = 'Calm Down Rema') {
    const rows = [];
    for (const id of Object.keys(PROVIDERS)) {
        const t0 = Date.now();
        try {
            const title = await withTimeout(PROVIDERS[id].probe(query), 45000, id);
            rows.push({ id, label: PROVIDERS[id].label, ok: true, ms: Date.now() - t0, info: title });
        } catch (e) {
            rows.push({ id, label: PROVIDERS[id].label, ok: false, ms: Date.now() - t0, info: String((e && (e.stderr || e.message)) || e).split('\n').filter(Boolean).pop().slice(0, 120) });
        }
    }
    try {
        const t0 = Date.now();
        await lyrics(query);
        rows.push({ id: 'lyrics', label: 'LRCLIB lyrics', ok: true, ms: Date.now() - t0, info: 'ok' });
    } catch (e) {
        rows.push({ id: 'lyrics', label: 'LRCLIB lyrics', ok: false, ms: 0, info: e.message });
    }
    skipUntil.clear();
    return rows;
}

module.exports = { ytFind, pipedFind, communityFind, fetchTrack, searchList, lyrics, diagnose, ORDER, PROVIDERS, saavnPick };
