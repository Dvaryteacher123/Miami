'use strict';

/**
 * QUIET SIGNAL LOGS
 * The encryption library (libsignal) prints huge objects to the console on every
 * session rotation ("Removing old closed session: SessionEntry { ... privKey ... }").
 * They are normal, but they flood the console, slow the panel, and they print
 * private key material (never share screenshots of them).
 * Set SHOW_SIGNAL_LOGS=true in .env to see them again.
 */

if (process.env.SHOW_SIGNAL_LOGS !== 'true') {
    const NOISY = [
        'Closing session',
        'Opening session',
        'Removing old closed session',
        'Decrypted message with closed session',
        'Migrating session',
        'Session already closed',
        'Session already open',
        'Closing open session in favor of incoming prekey bundle',
        'Closing stale open session for new outgoing prekey bundle'
    ];

    for (const method of ['log', 'info', 'warn']) {
        const original = console[method].bind(console);
        console[method] = (...args) => {
            const first = args[0];
            if (typeof first === 'string' && NOISY.some((p) => first.startsWith(p))) return;
            original(...args);
        };
    }
}


/* ------------------------------------------------------------------
 * BAD MAC detector
 * "Bad MAC" means the encryption state of a chat is out of sync. A few are
 * normal; a flood usually means the SAME WhatsApp number/session is running on
 * another server (or an old copy of data/ was restored). We print one summary
 * line per minute instead of hundreds of stack traces, and raise a BAD_MAC alert.
 * ------------------------------------------------------------------ */
(() => {
    let count = 0;
    const windowHits = [];
    let lastAlert = 0;
    const show = process.env.SHOW_SIGNAL_LOGS === 'true';
    const original = console.error.bind(console);

    console.error = (...args) => {
        const first = args[0];
        const text = typeof first === 'string' ? first : (first && first.message) || '';
        if (/Bad MAC|Session error/i.test(text)) {
            count += 1;
            windowHits.push(Date.now());
            return show ? original(...args) : undefined;
        }
        return original(...args);
    };

    setInterval(() => {
        const now = Date.now();
        while (windowHits.length && now - windowHits[0] > 10 * 60 * 1000) windowHits.shift();

        if (count > 0 && !show) {
            original(`[SIGNAL] ${count} "Bad MAC" decrypt errors in the last minute (encryption state out of sync).`);
        }
        count = 0;

        if (windowHits.length >= 25 && now - lastAlert > 30 * 60 * 1000) {
            lastAlert = now;
            try {
                require('./connlog').connlog('BAD_MAC',
                    `${windowHits.length} Bad MAC errors in 10 min. Likely the same WhatsApp number is running on another server, or an old copy of data/ was restored.`);
            } catch (_) {}
        }
    }, 60 * 1000).unref();
})();
