'use strict';

/**
 * CONNECTION LOG (black box recorder)
 * Writes every connect / disconnect / self-heal event to
 *   data/connection-events.log
 * so you can open ONE file in the panel and see exactly why the bot dropped,
 * without scrolling the console. Rotates at ~1MB.
 */

const fs = require('fs');
const path = require('path');

let file = null;

function resolveFile() {
    if (file) return file;
    try {
        const { DATA_DIR } = require('../database/fileStore');
        fs.mkdirSync(DATA_DIR, { recursive: true });
        file = path.join(DATA_DIR, 'connection-events.log');
    } catch (_) {
        file = path.join(process.cwd(), 'data', 'connection-events.log');
        try { fs.mkdirSync(path.dirname(file), { recursive: true }); } catch (_) {}
    }
    return file;
}

const listeners = [];
function onEvent(fn) { listeners.push(fn); }

function connlog(event, details) {
    for (const fn of listeners) { try { fn(event, details || ''); } catch (_) {} }
    try {
        const f = resolveFile();
        try {
            if (fs.statSync(f).size > 1024 * 1024) fs.renameSync(f, f + '.old');
        } catch (_) {}
        const t = new Date().toISOString().replace('T', ' ').slice(0, 19);
        fs.appendFile(f, `${t} | ${event} | ${details || ''}\n`, () => {});
    } catch (_) {}
}

module.exports = { connlog, onEvent };
