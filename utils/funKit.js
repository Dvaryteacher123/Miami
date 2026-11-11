'use strict';

/** Small helpers for the fun commands (daily-stable results per person). */

function seed(str) {
    let h = 2166136261;
    for (const ch of String(str)) {
        h ^= ch.charCodeAt(0);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function day() {
    const tz = process.env.BOT_TIMEZONE || 'Africa/Dar_es_Salaam';
    try {
        return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date());
    } catch (_) {
        return new Date().toISOString().slice(0, 10);
    }
}

/** The @mentioned person, or the person you replied to, or yourself. */
function target(ctx) {
    const m = ctx.msg?.message || {};
    const info =
        m.extendedTextMessage?.contextInfo ||
        m.imageMessage?.contextInfo ||
        m.videoMessage?.contextInfo ||
        {};
    const mentioned = info.mentionedJid?.[0] || info.participant;
    return String(mentioned || ctx.senderJid || ctx.msg?.key?.participant || ctx.msg?.key?.remoteJid || '');
}

function tag(jid) {
    return '@' + String(jid).split('@')[0].split(':')[0];
}

module.exports = { seed, day, target, tag };
