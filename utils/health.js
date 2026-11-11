'use strict';

/**
 * HEALTH RECORDER
 * Every WA_HEALTH_MIN minutes (default 30) writes one HEALTH line to
 * data/connection-events.log with the facts needed to explain a silent bot:
 * memory, disk used by the bot, event-loop lag, messages received, sends ok/failed,
 * and how long ago the last message arrived / last send worked.
 * Also keeps temp/logs/bot.log from growing forever.
 */

const fs = require('fs');
const path = require('path');
const v8 = require('v8');
const { connlog } = require('./connlog');

const startedAt = Date.now();
let incoming = 0, sendsOk = 0, sendsFail = 0;
let lastIncomingAt = 0, lastSendOkAt = 0;

function markIncoming(n = 1) { incoming += n; lastIncomingAt = Date.now(); }
function markSend(ok) { if (ok) { sendsOk++; lastSendOkAt = Date.now(); } else { sendsFail++; } }

const mb = (b) => Math.round(b / 1048576);
const ago = (t) => (t ? `${Math.round((Date.now() - t) / 60000)}min ago` : 'never');

async function dirSize(dir, cap = 200000) {
    let total = 0, seen = 0;
    const stack = [dir];
    while (stack.length && seen < cap) {
        const d = stack.pop();
        let entries;
        try { entries = await fs.promises.readdir(d, { withFileTypes: true }); } catch (_) { continue; }
        for (const e of entries) {
            const p = path.join(d, e.name);
            if (e.isDirectory()) { stack.push(p); continue; }
            seen++;
            try { total += (await fs.promises.stat(p)).size; } catch (_) {}
        }
    }
    return total;
}

function loopLag() {
    return new Promise((resolve) => {
        const t = Date.now();
        setImmediate(() => resolve(Date.now() - t));
    });
}

async function tick() {
    try {
        const mem = process.memoryUsage();
        const heapLimit = v8.getHeapStatistics().heap_size_limit;
        const root = process.cwd();
        const [dataB, tempB, lag] = await Promise.all([
            dirSize(path.join(root, 'data')),
            dirSize(path.join(root, 'temp')),
            loopLag()
        ]);

        let free = '';
        try {
            const s = await fs.promises.statfs(root);
            free = ` hostdisk_free=${mb(s.bavail * s.bsize)}MB`;
        } catch (_) {}

        connlog('HEALTH',
            `up=${(process.uptime() / 3600).toFixed(1)}h rss=${mb(mem.rss)}MB heap=${mb(mem.heapUsed)}/${mb(heapLimit)}MB ` +
            `bot_data=${mb(dataB)}MB bot_temp=${mb(tempB)}MB${free} loop_lag=${lag}ms ` +
            `msgs_in=${incoming} sends_ok=${sendsOk} sends_failed=${sendsFail} ` +
            `last_msg_in=${ago(lastIncomingAt)} last_send_ok=${ago(lastSendOkAt)}`);

        incoming = 0; sendsOk = 0; sendsFail = 0;
    } catch (_) {}
}

/* keep bot.log small: truncate when it passes ~8MB */
function capLogs() {
    try {
        const f = path.join(process.cwd(), 'temp', 'logs', 'bot.log');
        const size = fs.statSync(f).size;
        if (size > 8 * 1024 * 1024) {
            fs.truncateSync(f, 0);
            connlog('LOG_TRIMMED', `bot.log was ${mb(size)}MB and was emptied`);
        }
    } catch (_) {}
}

let started = false;
function start() {
    if (started) return;
    started = true;

    const everyMin = Number(process.env.WA_HEALTH_MIN) || 30;
    setTimeout(tick, 60 * 1000).unref();
    setInterval(tick, everyMin * 60 * 1000).unref();

    capLogs();
    setInterval(capLogs, 10 * 60 * 1000).unref();

    // MEMORY GUARD: if the process grows past the limit, exit so the panel / supervisor
    // starts it fresh (all sessions come back from data/auth). Default = 85% of the
    // container RAM. MEMORY_RESTART_MB=0 turns it off.
    try {
        const os = require('os');
        const constrained = typeof process.constrainedMemory === 'function' ? Number(process.constrainedMemory()) : 0;
        const totalMb = Math.floor(((constrained > 0 && constrained < os.totalmem()) ? constrained : os.totalmem()) / 1048576);
        const envMb = process.env.MEMORY_RESTART_MB;
        const limitMb = envMb !== undefined && envMb !== '' ? Number(envMb) : Math.floor(totalMb * 0.85);
        if (limitMb > 0) {
            let over = 0;
            setInterval(() => {
                const rss = Math.round(process.memoryUsage().rss / 1048576);
                over = rss > limitMb ? over + 1 : 0;
                if (over >= 3) { // 3 checks in a row (~90s) so a short spike does not restart it
                    try { connlog('MEMORY_RESTART', `rss=${rss}MB > ${limitMb}MB -> restarting process`); } catch (_) {}
                    console.error(`[MEMORY] ${rss}MB > ${limitMb}MB, restarting process`);
                    setTimeout(() => process.exit(1), 500);
                }
            }, 30 * 1000).unref();
        }
    } catch (_) {}

    connlog('BOOT', `PHONEPHIX BOT ${require('./version')} started (node ${process.version})`);
    heartbeat();
}

/* ------------------------------------------------------------------
 * HEARTBEAT: tells us, after a restart, WHY the bot was down.
 *  - last heartbeat long ago + clean=false -> the process was killed
 *    (out of memory, panel/host restart, container stopped)
 *  - clean=true -> somebody pressed Stop/Restart (reason is saved)
 * ------------------------------------------------------------------ */
const HB_FILE = path.join(__dirname, '..', 'data', 'heartbeat.json');

function writeHb(extra = {}) {
    try {
        fs.mkdirSync(path.dirname(HB_FILE), { recursive: true });
        fs.writeFileSync(HB_FILE, JSON.stringify({
            t: Date.now(), pid: process.pid, startedAt, version: require('./version'),
            clean: false, ...extra
        }));
    } catch (_) {}
}

function heartbeat() {
    let prev = null;
    try { prev = JSON.parse(fs.readFileSync(HB_FILE, 'utf8')); } catch (_) {}

    if (prev && prev.t) {
        const gapMin = Math.round((Date.now() - prev.t) / 60000);
        const how = prev.clean
            ? `stopped on purpose (${prev.reason || 'stop'})`
            : 'KILLED / CRASHED (no clean shutdown: out of memory, host restart or container stopped)';
        const msg = `Previous run was last alive ${gapMin} min ago (up ${Math.round(((prev.t - (prev.startedAt || prev.t)) / 60000))} min). It ${how}.`;
        connlog('PREV_RUN', msg);
        if (gapMin >= 3) {
            // delay so the Telegram alert listener is already attached
            setTimeout(() => connlog('RESTARTED', msg), 20000).unref();
        }
    }

    writeHb();
    setInterval(() => writeHb(), 60 * 1000).unref();

    for (const sig of ['SIGTERM', 'SIGINT']) {
        process.on(sig, () => {
            writeHb({ clean: true, reason: sig });
            process.exit(0);
        });
    }
}

module.exports = { start, markIncoming, markSend };
