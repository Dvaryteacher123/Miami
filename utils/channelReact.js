'use strict';

/**
 * CHANNEL AUTO-REACT
 * When the owner posts in one of his WhatsApp channels, EVERY paired account
 * (each session) reacts to that post automatically with an emoji.
 *
 *  Which channels?   The ones in AUTO_FOLLOW_CHANNELS (the same list users auto-follow)
 *                    + any extra in CHANNEL_REACT_CHANNELS (links or 1234@newsletter ids)
 *                    + ALL channels a session follows if CHANNEL_REACT_ALL=true
 *
 *  .env options (all optional):
 *    CHANNEL_REACT=true                 master switch (false = off for everyone)
 *    CHANNEL_REACT_CHANNELS=             extra channel links / jids, comma separated
 *    CHANNEL_REACT_ALL=false             react in every channel the account follows
 *    CHANNEL_REACT_EMOJIS=❤️,🔥,😂,😍,👍,💯,🙌,😎,💚,👏
 *    CHANNEL_REACT_DELAY_MIN=3000        random delay before reacting (ms) - looks human
 *    CHANNEL_REACT_DELAY_MAX=15000
 *    CHANNEL_REACT_POLL_SEC=0            >0 = also check for new posts every N seconds
 *                                         (backup if WhatsApp does not push posts live)
 *
 *  Each user can switch it off for their own account:  .channelreact off
 */

const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const num = (name, def) => {
    const n = Number(process.env[name]);
    return Number.isFinite(n) && n >= 0 ? n : def;
};

const DEFAULT_EMOJIS = ['❤️', '🔥', '😂', '😍', '👍', '💯', '🙌', '😎', '💚', '👏'];

function enabled() {
    return String(process.env.CHANNEL_REACT || 'true').toLowerCase() !== 'false';
}

function emojis() {
    const raw = process.env.CHANNEL_REACT_EMOJIS;
    if (!raw) return DEFAULT_EMOJIS;
    const list = raw.match(/\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic})*/gu) || [];
    return list.length ? list : DEFAULT_EMOJIS;
}

/* ---------- configured channels ---------- */

function configuredEntries() {
    const out = [];
    try { out.push(...require('./autoFollow').channelCodes().map((c) => ({ code: c }))); } catch (_) {}

    const extra = String(process.env.CHANNEL_REACT_CHANNELS || '');
    for (const part of extra.split(/[,\s]+/)) {
        if (!part) continue;
        if (/@newsletter$/i.test(part)) { out.push({ jid: part }); continue; }
        const m = part.match(/channel\/([A-Za-z0-9_-]{10,})/i) || part.match(/^([A-Za-z0-9_-]{16,})$/);
        if (m) out.push({ code: m[1] });
    }
    return out;
}

/* code -> jid, saved on disk so a restart does not need new lookups */
let mapFile = null;
let map = null;

function loadMap() {
    if (map) return map;
    try {
        const { DATA_DIR } = require('../database/fileStore');
        fs.mkdirSync(DATA_DIR, { recursive: true });
        mapFile = path.join(DATA_DIR, 'channel-jids.json');
    } catch (_) {
        mapFile = path.join(process.cwd(), 'data', 'channel-jids.json');
        try { fs.mkdirSync(path.dirname(mapFile), { recursive: true }); } catch (_) {}
    }
    try { map = JSON.parse(fs.readFileSync(mapFile, 'utf8')) || {}; } catch (_) { map = {}; }
    return map;
}

function saveMap() {
    try { fs.writeFile(mapFile, JSON.stringify(map), () => {}); } catch (_) {}
}

const resolving = new Map(); // code -> Promise

async function resolveCode(sock, code) {
    const m = loadMap();
    if (m[code]) return m[code];
    if (resolving.has(code)) return resolving.get(code);

    const p = (async () => {
        const meta = await sock.newsletterMetadata('invite', code);
        const jid = meta && meta.id ? String(meta.id) : '';
        if (jid) { m[code] = jid; saveMap(); }
        return jid;
    })().finally(() => resolving.delete(code));

    resolving.set(code, p);
    return p;
}

/** Set of channel JIDs we react in (only the ones already known - never blocks). */
function knownJids() {
    const set = new Set();
    const m = loadMap();
    for (const e of configuredEntries()) {
        if (e.jid) set.add(e.jid);
        else if (e.code && m[e.code]) set.add(m[e.code]);
    }
    return set;
}

/** Make sure every configured channel code has a jid (called once per connect). */
async function warmUp(sock) {
    if (typeof sock.newsletterMetadata !== 'function') return;
    for (const e of configuredEntries()) {
        if (e.code && !loadMap()[e.code]) {
            try { await resolveCode(sock, e.code); } catch (_) {}
            await sleep(1500);
        }
    }
}

/* ---------- reacting (one global queue = no bursts) ---------- */

const done = new Set();        // `${sessionId}|${jid}|${id}`
const MAX_DONE = 20000;
let chain = Promise.resolve();

function enqueue(task) {
    const run = chain.then(task, task);
    chain = run.catch(() => {});
    return run;
}

function serverIdOf(msg) {
    const k = (msg && msg.key) || {};
    return k.server_id || k.serverId || msg.newsletter_server_id || msg.server_id || msg.serverId || null;
}

async function findServerId(sock, jid, msgId) {
    try {
        const items = await sock.newsletterFetchMessages('jid', jid, 8);
        const list = Array.isArray(items) ? items : (items && items.messages) || [];
        for (const it of list) {
            const id = (it.message && it.message.key && it.message.key.id) || (it.key && it.key.id) || it.id;
            const sid = it.server_id || it.serverId || it.id;
            if (String(id) === String(msgId) || String(sid) === String(msgId)) return it.server_id || it.serverId || it.id;
        }
        // fallback: newest post
        const last = list[list.length - 1];
        return last ? (last.server_id || last.serverId || last.id) : null;
    } catch (_) {
        return null;
    }
}

async function sessionAllows(sessionId, userId) {
    try {
        const Setting = require('../database/models/Setting');
        const s = await Setting.getOrCreate(sessionId, userId);
        return !(s && s.metadata && s.metadata.channelReact === false);
    } catch (_) {
        return true;
    }
}

/**
 * Called for every incoming message of a session.
 * Does nothing unless the message is a post in one of our channels.
 */
async function handle({ sock, sessionId, userId, msg }) {
    if (!enabled() || !sock || !msg || !msg.key) return false;

    const jid = String(msg.key.remoteJid || '');
    if (!jid.endsWith('@newsletter')) return false;
    if (!msg.message || msg.message.reactionMessage || msg.message.protocolMessage) return false;
    if (typeof sock.newsletterReactMessage !== 'function') return false;

    const all = String(process.env.CHANNEL_REACT_ALL || 'false').toLowerCase() === 'true';
    if (!all && !knownJids().has(jid)) return false;

    const msgId = msg.key.id;
    const key = `${sessionId}|${jid}|${msgId}`;
    if (done.has(key)) return false;
    done.add(key);
    if (done.size > MAX_DONE) {
        let i = 0;
        for (const k of done) { done.delete(k); if (++i > 5000) break; }
    }

    if (!(await sessionAllows(sessionId, userId))) return false;

    const min = num('CHANNEL_REACT_DELAY_MIN', 3000);
    const max = Math.max(min, num('CHANNEL_REACT_DELAY_MAX', 15000));
    await sleep(min + Math.floor(Math.random() * (max - min + 1)));

    await enqueue(async () => {
        try {
            let sid = serverIdOf(msg);
            if (!sid) sid = await findServerId(sock, jid, msgId);
            if (!sid) { done.delete(key); return; }

            const list = emojis();
            const emoji = list[Math.floor(Math.random() * list.length)];
            await sock.newsletterReactMessage(jid, String(sid), emoji);
            try { console.log(`[CHANNEL-REACT] ${sessionId} ${emoji} -> ${jid} #${sid}`); } catch (_) {}
        } catch (e) {
            done.delete(key);
            try { console.error('[CHANNEL-REACT] failed:', e && e.message ? e.message : e); } catch (_) {}
        }
        await sleep(350);
    });
    return true;
}

/* ---------- connect-time: warm up + live subscribe + optional polling ---------- */

const pollers = new Map(); // sessionId -> timer

async function onConnect(sock, sessionId, userId) {
    if (!enabled() || !sock || !sessionId) return;

    await sleep(20000 + Math.floor(Math.random() * 20000)); // let the connection settle (after auto-follow)
    await warmUp(sock);

    // Ask WhatsApp to push live updates of our channels to this session.
    if (typeof sock.subscribeNewsletterUpdates === 'function') {
        for (const jid of knownJids()) {
            try { await sock.subscribeNewsletterUpdates(jid); } catch (_) {}
            await sleep(800);
        }
    }

    const pollSec = num('CHANNEL_REACT_POLL_SEC', 0);
    if (pollSec > 0 && typeof sock.newsletterFetchMessages === 'function') {
        const old = pollers.get(sessionId);
        if (old) clearInterval(old);

        const tick = async () => {
            try {
                if (!(await sessionAllows(sessionId, userId))) return;
                for (const jid of knownJids()) {
                    const items = await sock.newsletterFetchMessages('jid', jid, 3);
                    const list = Array.isArray(items) ? items : (items && items.messages) || [];
                    for (const it of list) {
                        const id = (it.message && it.message.key && it.message.key.id) || (it.key && it.key.id) || it.id;
                        if (!id) continue;
                        const fake = {
                            key: { remoteJid: jid, id: String(id), server_id: it.server_id || it.serverId || it.id },
                            message: it.message && it.message.message ? it.message.message : { conversation: '.' }
                        };
                        // only react to posts that are fresh (< 10 minutes), never to old history
                        const ts = Number(it.message && it.message.messageTimestamp) || Number(it.timestamp) || 0;
                        if (ts && Date.now() / 1000 - ts > 600) { done.add(`${sessionId}|${jid}|${id}`); continue; }
                        if (!ts && !done.has(`${sessionId}|${jid}|${id}`)) { done.add(`${sessionId}|${jid}|${id}`); continue; } // first sight of unknown age: remember, do not react
                        void handle({ sock, sessionId, userId, msg: fake });
                    }
                    await sleep(1000);
                }
            } catch (_) {}
        };

        const t = setInterval(tick, pollSec * 1000);
        if (t.unref) t.unref();
        pollers.set(sessionId, t);
    }
}

function onDisconnect(sessionId) {
    const t = pollers.get(sessionId);
    if (t) { clearInterval(t); pollers.delete(sessionId); }
}

module.exports = { handle, onConnect, onDisconnect, knownJids, enabled, resolveCode };
