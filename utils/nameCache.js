'use strict';

/**
 * Remembers WhatsApp display names (pushName) of people the bot has seen in messages,
 * so the welcome message can show a new member's name when it is known.
 * (WhatsApp does not send the name together with "joined the group".)
 */

const names = new Map(); // phone digits -> name

const digits = (jid) => String(jid || '').split(':')[0].split('@')[0].replace(/[^\d]/g, '');

function remember(msg) {
    try {
        const name = String(msg?.pushName || '').trim();
        if (!name) return;
        const phone = digits(msg.key?.participant || msg.key?.remoteJid);
        if (!phone) return;
        if (names.size > 20000) names.delete(names.keys().next().value);
        names.set(phone, name);
    } catch (_) {}
}

function get(jid) {
    return names.get(digits(jid)) || '';
}

module.exports = { remember, get };
