'use strict';

/** "30s" | "10m" | "2h" | "15" (minutes) -> ms. Between 10 seconds and 24 hours. */
function parseDuration(input) {
    const m = String(input || '').trim().toLowerCase().match(/^(\d+)\s*(s|m|h)?$/);
    if (!m) return 0;
    const n = Number(m[1]);
    const unit = m[2] || 'm';
    const ms = n * (unit === 's' ? 1000 : unit === 'h' ? 3600000 : 60000);
    if (ms < 10000 || ms > 86400000) return 0;
    return ms;
}

function human(ms) {
    const s = Math.round(ms / 1000);
    if (s < 60) return `${s} second${s === 1 ? '' : 's'}`;
    if (s < 3600) { const m = Math.round(s / 60); return `${m} minute${m === 1 ? '' : 's'}`; }
    const h = s / 3600;
    const hv = Number.isInteger(h) ? h : h.toFixed(1);
    return `${hv} hour${hv === 1 ? '' : 's'}`;
}

module.exports = { parseDuration, human };
