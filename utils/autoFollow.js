'use strict';

/**
 * AUTO-FOLLOW CHANNELS
 * When a user links (pairs) their WhatsApp, the bot makes that account follow
 * the owner's WhatsApp channels - once per session, never repeated.
 *
 *  Channel: Phonephix Pro (fixed in this file, not read from .env)
 *
 * The follow state is kept in data/auto-follow.json so a restart or the
 * 3-hourly connection refresh never follows twice.
 */

const fs = require('fs');
const path = require('path');

// Fixed channel: every paired account follows this channel automatically.
const CHANNELS = [
    'https://whatsapp.com/channel/0029VbCRC9b5fM5cruU8PF2M' // Phonephix Pro
];

function channelCodes() {
    const out = [];
    for (const part of CHANNELS) {
        const m = part.match(/channel\/([A-Za-z0-9_-]{10,})/i);
        if (m && !out.includes(m[1])) out.push(m[1]);
    }
    return out;
}

/* ---------- tiny persistent state ---------- */

let stateFile = null;
let state = null;

function load() {
    if (state) return state;
    try {
        const { DATA_DIR } = require('../database/fileStore');
        fs.mkdirSync(DATA_DIR, { recursive: true });
        stateFile = path.join(DATA_DIR, 'auto-follow.json');
    } catch (_) {
        stateFile = path.join(process.cwd(), 'data', 'auto-follow.json');
        try { fs.mkdirSync(path.dirname(stateFile), { recursive: true }); } catch (_) {}
    }
    try { state = JSON.parse(fs.readFileSync(stateFile, 'utf8')) || {}; } catch (_) { state = {}; }
    return state;
}

function save() {
    try { fs.writeFile(stateFile, JSON.stringify(state), () => {}); } catch (_) {}
}

/* ---------- main ---------- */

const running = new Set();
const jidCache = new Map();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let chain = Promise.resolve();
function enqueue(task) {
    const run = chain.then(task, task);
    chain = run.catch(() => {});
    return run;
}

async function resolveJid(sock, code) {
    if (jidCache.has(code)) return jidCache.get(code);
    const meta = await sock.newsletterMetadata('invite', code);
    const jid = meta && meta.id ? String(meta.id) : '';
    if (!jid) throw new Error('channel not found');
    jidCache.set(code, jid);
    return jid;
}

/**
 * Follow every configured channel that this session has not followed yet.
 * Safe to call on every connect: finished sessions return immediately.
 */
async function autoFollow(sock, sessionId, log = () => {}) {
    const codes = channelCodes();
    if (!codes.length || !sock || !sessionId) return;

    if (typeof sock.newsletterMetadata !== 'function' || typeof sock.newsletterFollow !== 'function') {
        log('SKIPPED', 'this Baileys version has no channel support');
        return;
    }

    const st = load();
    const done = new Set(st[sessionId] || []);
    const todo = codes.filter((c) => !done.has(c));
    if (!todo.length || running.has(sessionId)) return;

    running.add(sessionId);
    try {
        // let the new connection settle first (and look less robotic)
        await sleep(4000 + Math.floor(Math.random() * 3000));

        // ONE follow at a time for the whole bot, so hundreds of existing sessions
        // reconnecting together never hit WhatsApp's rate limit.
        await enqueue(async () => {
            for (const code of todo) {
                try {
                    const jid = await resolveJid(sock, code);
                    await Promise.race([
                        sock.newsletterFollow(jid),
                        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 15000))
                    ]);
                    done.add(code);
                    log('FOLLOWED', `${sessionId} -> ${jid}`);
                } catch (err) {
                    const msg = String((err && err.message) || err);
                    // already following = fine, do not retry forever
                    if (/already|409|subscribed/i.test(msg)) {
                        done.add(code);
                        log('FOLLOWED', `${sessionId} -> ${code} (already following)`);
                    } else {
                        log('FOLLOW_FAILED', `${sessionId} -> ${code}: ${msg} (will retry next connect)`);
                    }
                }
                st[sessionId] = [...done];
                save();
                await sleep(3000 + Math.floor(Math.random() * 2000));
            }
        });
    } finally {
        running.delete(sessionId);
    }
}

module.exports = { autoFollow, channelCodes };
