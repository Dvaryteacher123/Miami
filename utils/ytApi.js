'use strict';
const axios = require('axios');

const YT_REGEX = /(https?:\/\/)?((www|m|music)\.)?(youtube(-nocookie)?\.com\/(watch\?v=|shorts\/|live\/)|youtu\.be\/)[\w-]+(\S*)?/i;
const http = axios.create({
    timeout: 25000,
    headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36' }
});

const FAA = 'https://api-faa.my.id/faa';
// Extra backup APIs: add more in .env as MUSIC_API_BASES=https://a.com/faa,https://b.com/faa
const BASES = [FAA, ...(process.env.MUSIC_API_BASES || '').split(',').map(s => s.trim()).filter(Boolean)];

function extractUrl(text) {
    const m = String(text || '').match(YT_REGEX);
    if (!m) return null;
    return /^https?:/i.test(m[0]) ? m[0] : 'https://' + m[0];
}

async function tryBases(path, params) {
    let lastErr;
    for (const base of BASES) {
        try {
            const { data } = await http.get(base + path, { params });
            if (data && data.status && data.result) return data.result;
            lastErr = new Error('API returned no result');
        } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('All APIs failed');
}

async function search(query) {
    const r = await tryBases('/youtube', { q: query });
    return Array.isArray(r) ? r : [];
}
async function play(query) { return tryBases('/ytplay', { query }); }
async function mp3(url) { return tryBases('/ytmp3', { url }); }
async function mp4(url) { return tryBases('/ytmp4', { url }); }

module.exports = { extractUrl, search, play, mp3, mp4 };
