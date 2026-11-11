/**
 * =====================================================
 *  PHONEPHIX BOT - SINGLE-USER START
 *  One deployment = one WhatsApp number.
 *  logo -> ask number -> pair code -> auto-follow channel
 *  No website, no Telegram.
 * =====================================================
 */

'use strict';

require('dotenv').config();

// quiet console so the pair code is easy to see (set LOG_LEVEL=info to see everything)
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'warn';
process.env.PHONEPHIX_SINGLE = '1';

const http = require('http');
const readline = require('readline');
const crypto = require('crypto');

const banner = require('./banner');
const guard = require('./guard');

banner.logo(process.env.BOT_VERSION);

process.on('unhandledRejection', (e) => console.error('[PHONEPHIX] unhandledRejection:', e && e.message ? e.message : e));
process.on('uncaughtException', (e) => console.error('[PHONEPHIX] uncaughtException:', e && e.stack ? e.stack : e));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const validPhone = (p) => /^\d{8,15}$/.test(p);

/* ---------- ask for the number ---------- */

function promptNumber() {
    return new Promise((resolve) => {
        let done = false;
        const finish = (v) => { if (!done) { done = true; try { rl.close(); } catch (_) {} resolve(v); } };

        const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
        rl.on('close', () => finish(null));          // stdin closed (Render / Railway / Heroku)

        const ask = (again) => banner.enterNumberPrompt(again);
        ask(false);
        const reminder = setInterval(() => ask(true), 30000);     // keeps the prompt at the bottom of the console
        rl.on('close', () => clearInterval(reminder));
        rl.on('line', (line) => {
            const p = guard.digits(line);
            if (validPhone(p)) { clearInterval(reminder); return finish(p); }
            console.log('  Invalid number. Use the country code, no "+", 8-15 digits.');
            ask(false);
        });
    });
}

async function getNumber() {
    const fromEnv = guard.digits(process.env.WHATSAPP_NUMBER || process.env.PAIR_NUMBER || '');
    if (fromEnv) {
        if (validPhone(fromEnv)) return fromEnv;
        console.log('  WHATSAPP_NUMBER is not valid (example: 255712345678).');
    }
    banner.askNumberHelp();
    return promptNumber();
}

/* ---------- optional keep-alive port (Render web service / Heroku web) ---------- */

function startKeepAlivePort() {
    const port = parseInt(process.env.PORT, 10);
    if (!port) return;
    try {
        http.createServer((req, res) => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Phonephix Bot is running');
        }).listen(port, '0.0.0.0').on('error', () => {});
    } catch (_) {}
}

/* ---------- main ---------- */

(async () => {
    startKeepAlivePort();

    guard.integrityOrDie();
    guard.ensureSingleProcess();
    guard.verifyLockOrDie();

    const database = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../database/database');
    await database.connect();

    await require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../bot/baileys').load();

    const Session = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../database/models/Session');
    const User = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../database/models/User');
    const { removeAuth } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../bot/authStore');
    const BotManager = require('./manager');

    // a pairing that was never finished cannot be resumed: drop it and ask again
    try {
        const stale = await Session.find({ isActive: true });
        for (const s of stale || []) {
            if (s.status === 'pairing') {
                removeAuth(s.sessionId);
                await Session.deleteMany({ sessionId: s.sessionId });
            }
        }
    } catch (_) {}

    const manager = new BotManager(null);
    global.botManager = manager;

    let linkedPhone = '';
    let pairingPhone = '';

    manager.on('event', ({ event, payload }) => {
        if (event === 'session:pair-code') {
            banner.pairCode(payload.code, pairingPhone || linkedPhone || '');
        } else if (event === 'session:connected') {
            const phone = guard.digits(payload.phoneNumber || pairingPhone);
            if (phone) guard.writeLock(phone);
            linkedPhone = phone;
            banner.connected(phone || 'WhatsApp');
        } else if (event === 'session:logged-out') {
            console.log('\n  [PHONEPHIX] WhatsApp logged this device out. Start the bot again to pair a new session.\n');
            setTimeout(() => process.exit(1), 1500);
        }
    });

    await manager.init();

    if (manager.instances.size > 0) {
        // restored the saved session: nothing to ask
        const locked = guard.lockedPhone();
        const envPhone = guard.digits(process.env.WHATSAPP_NUMBER || '');
        console.log('  [OK] Restoring the saved session' + (locked ? ` (${locked})` : '') + '...');
        if (locked && envPhone && envPhone !== locked) {
            console.log(`  [!] This bot is locked to ${locked}; WHATSAPP_NUMBER=${envPhone} was ignored.`);
        }
    } else {
        const phone = await getNumber();
        if (!phone) {
            banner.noNumberHelp();
            setInterval(() => {}, 1 << 30);     // stay alive so the platform shows the instructions
            return;
        }

        pairingPhone = phone;
        console.log(`\n  Requesting a pair code for ${phone} ... please wait a few seconds.\n`);

        const owner = await User.ensureOwner('phonephix-owner', crypto.randomBytes(16).toString('hex'));
        try {
            await manager.createPairingSession({
                userId: owner._id || owner.id,
                phoneNumber: phone,
                ownerTag: 'owner'
            });
        } catch (err) {
            console.error('  [PHONEPHIX] Could not start pairing: ' + err.message);
            process.exit(1);
        }
    }

    // keep the one-session rule enforced while running
    const sweeper = setInterval(() => { guard.sweep(manager, Session).catch(() => {}); }, 30000);
    sweeper.unref();

    const shutdown = async () => {
        try { await manager.shutdown(); } catch (_) {}
        try { await database.disconnect(); } catch (_) {}
        process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
})().catch((err) => {
    const missing = err && err.code === 'MODULE_NOT_FOUND' && /^\.{1,2}\//.test(String(err.message).split("'")[1] || '');
    if (missing) {
        console.error('\n  [PHONEPHIX] A bot file is missing or damaged. The bot has been shut down. Use the original, unmodified package.\n');
        process.exit(0);
    }

    console.error('[PHONEPHIX] FATAL:', err && err.stack ? err.stack : err);
    process.exit(1);
});
