/**
 * =====================================================
 *  OUTBOUND THROTTLE  (foleni ya kutuma ujumbe)
 *  Ujumbe wote wa bot unapita kwenye foleni yenye kasi
 *  salama na ya haraka kwa kila session. Watu
 *  wakiwa wengi wanapata majibu kwa mpangilio, na
 *  WhatsApp haioni "mlipuko" wa ujumbe unaoweza
 *  kukatisha / kuban namba.
 * =====================================================
 */

'use strict';

const health = require('../utils/health');

const MIN_GAP_MS = Math.max(10, Number(process.env.SEND_MIN_GAP_MS) || 30);
const MAX_QUEUE = Math.max(100, Number(process.env.SEND_MAX_QUEUE) || 1500);
// Jobs waiting longer than this are dropped (user already gave up / retried)
const STALE_MS = Number(process.env.SEND_STALE_MS) || 120000;
const CONCURRENCY = Math.max(1, Number(process.env.SEND_CONCURRENCY) || 5);
// A send that does not finish in this time frees its slot (a dead connection used
// to block sends for 90s each, so the menu "took a minute"). Several in a row =
// the connection is dead -> ask the connection to rebuild itself.
const SEND_TIMEOUT_MS = Number(process.env.SEND_TIMEOUT_MS) || 30000;
const STALL_LIMIT = Number(process.env.SEND_STALL_LIMIT) || 3;

function wrapSocket(sock) {
    if (!sock || sock.__throttled || typeof sock.sendMessage !== 'function') return sock;

    const base = sock.sendMessage.bind(sock);
    // every send goes through the branding step (View Channel / View Group buttons on command replies)
    const original = (jid, content, options) => require('../utils/brand').send(sock, base, jid, content, options);
    const queue = [];
    let active = 0;
    let lastStart = 0;
    let timer = null;
    let stallStreak = 0;

    function pump() {
        if (timer || !queue.length || active >= CONCURRENCY) return;

        const wait = Math.max(0, lastStart + MIN_GAP_MS - Date.now());

        timer = setTimeout(() => {
            timer = null;
            let job = queue.shift();

            // skip jobs that waited too long: sending them now only adds load
            while (job && Date.now() - job.at > STALE_MS) {
                job.reject(new Error('Message expired in the send queue'));
                job = queue.shift();
            }

            if (!job) {
                pump();
                return;
            }

            active++;
            lastStart = Date.now();

            let sendTimer;
            Promise.race([
                Promise.resolve().then(() => original(job.jid, job.content, job.options)),
                new Promise((_, rej) => {
                    sendTimer = setTimeout(() => rej(new Error('SEND_TIMEOUT')), SEND_TIMEOUT_MS);
                })
            ])
                .then((res) => { stallStreak = 0; try { health.markSend(true); } catch (_) {} sock.__lastSendOkAt = Date.now(); return res; })
                .catch((err) => {
                    try { health.markSend(false); } catch (_) {}
                    if (err && err.message === 'SEND_TIMEOUT') {
                        stallStreak += 1;
                        if (stallStreak >= STALL_LIMIT) {
                            stallStreak = 0;
                            try { if (typeof sock.__onSendStall === 'function') sock.__onSendStall(); } catch (_) {}
                        }
                    }
                    throw err;
                })
                .finally(() => clearTimeout(sendTimer))
                .then((res) => {
                    // Kumbuka ujumbe uliotumwa ili WhatsApp ikiomba "retry"
                    // (Waiting for this message) bot iweze kuutuma tena.
                    try {
                        if (typeof sock.__onSent === 'function') sock.__onSent(res);
                    } catch (_) {}
                    return res;
                })
                .then(job.resolve, job.reject)
                .finally(() => {
                    active--;
                    pump();
                });

            pump();
        }, wait);
    }

    sock.sendMessage = (jid, content, options) =>
        new Promise((resolve, reject) => {
            if (queue.length >= MAX_QUEUE) {
                return reject(new Error('Bot is busy, please try again in a moment.'));
            }
            queue.push({ jid, content, options, resolve, reject, at: Date.now() });
            pump();
        });

    sock.__throttled = true;
    sock.__queueSize = () => queue.length;
    sock.__clearSendQueue = () => {
        // Do not reject already-running sends. Only remove stale queued jobs
        // when a socket is rebuilt.
        while (queue.length) {
            const job = queue.shift();
            try { job.reject(new Error('Socket reconnected; queued message was dropped.')); } catch (_) {}
        }
    };

    return sock;
}

module.exports = { wrapSocket };
