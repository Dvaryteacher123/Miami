'use strict';

/**
 * =====================================================
 *  PHONEPHIX BOT - SINGLE-SESSION GUARD
 * =====================================================
 *  This deployment serves ONE WhatsApp number. Several independent
 *  checks (manager, connection start, connect-time, watchdog) make
 *  running extra sessions from the same deployment hard:
 *
 *   1. signed lock file  (data/.phonephix-lock)  - number + install id + HMAC
 *   2. hard cap of ONE live socket inside BotManager
 *   3. createSession only accepts the locked number
 *   4. on connect, the real WhatsApp number must equal the locked number
 *   5. watchdog every 30s: stops extra sockets, deactivates extra DB rows,
 *      re-verifies the lock signature
 *   6. PID lock: two processes can't share one data/ folder
 *
 *  Be honest: this is JavaScript on a machine the deployer controls, so
 *  nothing here is unbreakable - it raises the effort a lot.
 * =====================================================
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const { DATA_DIR } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../database/fileStore');

const LOCK_FILE = path.join(DATA_DIR, '.phonephix-lock');
const PID_FILE = path.join(DATA_DIR, '.phonephix-pid');
const PEPPER = 'phonephix\u200b::one-number::' + 'x7Qe2' + 'Lk9' + 'Vm4';

const digits = (v) => String(v || '').replace(/[^\d]/g, '');

function sign(phone, installId) {
    return crypto
        .createHmac('sha256', PEPPER + installId)
        .update('phone:' + digits(phone))
        .digest('hex');
}

function fail(msg) {
    console.error('\n  [PHONEPHIX] ' + msg + '\n');
    process.exit(0);
}

/* ---------------- lock file ---------------- */

/** @returns {null | {phone:string, installId:string, valid:boolean}} */
function readLock() {
    let raw;
    try { raw = fs.readFileSync(LOCK_FILE, 'utf8'); } catch (_) { return null; }
    try {
        const j = JSON.parse(Buffer.from(raw.trim(), 'base64').toString('utf8'));
        const canonical = Buffer.from(JSON.stringify(j)).toString('base64') === raw.trim();
        const valid = canonical && !!j.phone && !!j.installId && j.sig === sign(j.phone, j.installId);
        return { phone: digits(j.phone), installId: String(j.installId || ''), valid };
    } catch (_) {
        return { phone: '', installId: '', valid: false };
    }
}

function writeLock(phone) {
    const p = digits(phone);
    if (!p) return;
    const prev = readLock();
    const installId = prev && prev.installId ? prev.installId : crypto.randomBytes(12).toString('hex');
    const body = { phone: p, installId, sig: sign(p, installId), host: crypto.createHash('sha1').update(os.hostname()).digest('hex').slice(0, 8) };
    try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.writeFileSync(LOCK_FILE, Buffer.from(JSON.stringify(body)).toString('base64'));
    } catch (_) {}
}

function lockedPhone() {
    const l = readLock();
    return l && l.valid ? l.phone : '';
}

/** Called at boot. Refuses to run with a damaged lock. */
function verifyLockOrDie() {
    const l = readLock();
    if (!l) return;
    if (!l.valid) {
        fail('The bot lock is damaged (tampered). Delete the "data/" folder to start over and link your number again.');
    }
}

/* ---------------- process lock ---------------- */

function alive(pid) {
    try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; }
}

function ensureSingleProcess() {
    try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
        const other = parseInt(fs.readFileSync(PID_FILE, 'utf8'), 10);
        if (other && other !== process.pid && other !== process.ppid && alive(other)) {
            fail(`Another bot is already using this data folder (PID ${other}). Only one instance is allowed.`);
        }
    } catch (_) {}
    try { fs.writeFileSync(PID_FILE, String(process.pid)); } catch (_) {}
    process.on('exit', () => {
        try {
            if (parseInt(fs.readFileSync(PID_FILE, 'utf8'), 10) === process.pid) fs.unlinkSync(PID_FILE);
        } catch (_) {}
    });
}

/* ---------------- manager hooks ---------------- */

/** createSession(): only ONE number, only when no other session is alive. */
function beforeCreate(manager, phone) {
    const p = digits(phone);
    const locked = lockedPhone();
    if (locked && p && locked !== p && manager.instances.size > 0) {
        throw new Error('This bot is locked to a single number.');
    }
    for (const inst of manager.instances.values()) {
        if (inst && digits(inst.phoneNumber) !== p) {
            throw new Error('Another session already exists. Only one session is allowed.');
        }
    }
}

/** startSession(): never more than one live socket. */
function beforeStart(manager, sessionId) {
    if (!manager.instances.has(sessionId) && manager.instances.size >= 1) {
        throw new Error('Only one session is allowed on this deployment.');
    }
}

/** loadAllSessions(): keep only the locked number (or the first one). */
function filterSessions(docs) {
    const list = Array.isArray(docs) ? docs : [];
    if (list.length <= 1) return list;
    const locked = lockedPhone();
    const keep = list.find((d) => locked && digits(d.phoneNumber) === locked) || list[0];
    return [keep];
}

/** _onConnected(): the number that really logged in must be the locked one. */
function connectedPhoneOk(phone) {
    const p = digits(phone);
    const locked = lockedPhone();
    if (!p || !locked) return true;
    return p === locked;
}

/** Called every 30s from start.js */
async function sweep(manager, Session) {
    // 1) extra live sockets
    if (manager.instances.size > 1) {
        const locked = lockedPhone();
        const ids = Array.from(manager.instances.keys());
        let keep = ids.find((id) => locked && digits(manager.instances.get(id)?.phoneNumber) === locked) || ids[0];
        for (const id of ids) {
            if (id === keep) continue;
            try { await manager.deleteSession(id, { logout: true }); } catch (_) {}
        }
    }
    // 2) extra DB rows
    try {
        const rows = await Session.listAllActive();
        if (rows && rows.length > 1) {
            const keepRow = filterSessions(rows)[0];
            for (const r of rows) {
                if (r.sessionId === keepRow.sessionId) continue;
                try { await manager.deleteSession(r.sessionId, { logout: true }); } catch (_) {}
            }
        }
    } catch (_) {}
    // 3) code unchanged?
    integrityOrDie();
    // 4) lock still intact?
    const l = readLock();
    if (l && !l.valid) fail('The bot lock was damaged while running. Shutting down.');
}

/* ---------------- integrity (code files) ---------------- */

// Every shipped .js file is fingerprinted in single/manifest.json.
//   changed or deleted code file  -> the bot shuts down
//   NEW files (custom commands, panel leftovers, docs, hidden folders) -> ignored
const ROOT = path.resolve(__dirname, '..', '..', '..', '..', '..', '..', '..', '..', '..', '..', '..', '..', '..', '..', '..', '..', '..', '..', '..', '..', '..', '..', '..', '..', '..', '..', '..', '..', '..', '..', '..', '..', '..', '..', '..', '..', '..', '..', '..', '..');
const SKIP_REL = new Set(['node_modules', 'data', 'temp', 'media']);   // top-level only
const CUSTOM_REL = 'phonephix/custom';
let integrityCache = { at: 0, ok: true };

function fileHashes() {
    const out = {};
    const walk = (dir, rel) => {
        let names = [];
        try { names = fs.readdirSync(dir); } catch (_) { return; }
        for (const name of names.sort()) {
            if (name.startsWith('.')) continue;
            const abs = path.join(dir, name);
            const r = rel ? rel + '/' + name : name;
            let st;
            try { st = fs.statSync(abs); } catch (_) { continue; }
            if (st.isDirectory()) {
                if (!SKIP_REL.has(r) && r !== CUSTOM_REL) walk(abs, r);
            } else if (/\.js$/i.test(name)) {
                try {
                    // same hash with LF or CRLF line endings (GitHub / Windows safe)
                    const text = fs.readFileSync(abs, 'utf8').replace(/\r\n/g, '\n');
                    out[r] = crypto.createHash('sha256').update(text).digest('hex');
                } catch (_) { out[r] = 'unreadable'; }
            }
        }
    };
    walk(ROOT, '');
    return out;
}

function manifestSig(hashes) {
    return crypto.createHmac('sha256', PEPPER + 'manifest').update(JSON.stringify(hashes)).digest('hex');
}

/** true while every shipped code file is exactly as released (cached 60s) */
function integrityOk() {
    if (Date.now() - integrityCache.at < 60000) return integrityCache.ok;
    let ok = false;
    try {
        const m = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'));
        const now = fileHashes();
        const bad = Object.keys(m.hashes || {}).filter((f) => now[f] !== m.hashes[f]);
        ok = m.sig === manifestSig(m.hashes) && bad.length === 0;
        if (!ok && /^(1|true|yes)$/i.test(String(process.env.INTEGRITY_DEBUG || ''))) {
            console.error('  [PHONEPHIX] Integrity debug (first 20): ' + (bad.slice(0, 20).join(', ') || 'manifest signature'));
        }
    } catch (_) { ok = false; }
    integrityCache = { at: Date.now(), ok };
    return ok;
}

function integrityOrDie() {
    if (!integrityOk()) fail('Bot code was changed or deleted (integrity check failed). The bot has been shut down. Use the original, unmodified release.');
}

/* ---------------- pairing attempts limit ---------------- */

const ATTEMPT_FILE = path.join(DATA_DIR, '.phonephix-attempts');

/** max 4 pair-code requests per hour, 45s apart */
function allowPairAttempt() {
    let list = [];
    try { list = JSON.parse(fs.readFileSync(ATTEMPT_FILE, 'utf8')); } catch (_) {}
    const now = Date.now();
    list = (Array.isArray(list) ? list : []).filter((t) => now - t < 3600000);
    if (list.length && now - list[list.length - 1] < 45000) return { ok: false, wait: Math.ceil((45000 - (now - list[list.length - 1])) / 1000) };
    if (list.length >= 4) return { ok: false, wait: Math.ceil((3600000 - (now - list[0])) / 1000) };
    list.push(now);
    try { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.writeFileSync(ATTEMPT_FILE, JSON.stringify(list)); } catch (_) {}
    return { ok: true, wait: 0 };
}

module.exports = {
    integrityOk, integrityOrDie, allowPairAttempt, fileHashes, manifestSig,
    readLock, writeLock, lockedPhone, verifyLockOrDie,
    ensureSingleProcess,
    beforeCreate, beforeStart, filterSessions, connectedPhoneOk, sweep,
    digits
};
