'use strict';

/**
 * JOIN GATE - people must join the channels and groups below before commands work.
 *   JOIN_CHANNELS=https://whatsapp.com/channel/AAA,https://whatsapp.com/channel/BBB
 *   JOIN_GROUPS=120363xxxx@g.us,120363yyyy@g.us        (the bot must be a member of these)
 * Channels: cannot be checked by WhatsApp bots, so the person confirms with .joined.
 * Groups:   checked for real. The person must be a member of every group listed.
 * Turn off with JOIN_GATE=false.
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'joined.json');
let cache = null;

function list(v) {
    return String(v || '').split(',').map((s) => s.trim()).filter(Boolean);
}

const CHANNELS = list(process.env.JOIN_CHANNELS || 'https://whatsapp.com/channel/0029Vb9cHsQB4hdaEMxqYX3p,https://whatsapp.com/channel/0029VbEMjKAKwqSVJoTUuG04,https://whatsapp.com/channel/0029Vb9EaOB5kg776LfvSm1b,https://whatsapp.com/channel/0029VbDtQFUAzNc4VRjXH429,https://whatsapp.com/channel/0029Vb9Lum13GJP10Q1VqO0M');
const GROUPS = list(process.env.JOIN_GROUPS);
const CHANNEL_NAME = process.env.JOIN_CHANNEL_NAME || 'our';

function load() {
    if (cache) return cache;
    try { cache = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch (_) { cache = {}; }
    return cache;
}

function save() {
    try {
        fs.mkdirSync(path.dirname(FILE), { recursive: true });
        fs.writeFileSync(FILE, JSON.stringify(cache, null, 2));
    } catch (_) {}
}

function enabled() {
    // single-user build: people are not forced to join anything (the bot account follows the channel itself)
    return String(process.env.JOIN_GATE || 'false').toLowerCase() === 'true';
}

function isJoined(jid) {
    return !!load()[String(jid || '')];
}

function markJoined(jid) {
    load()[String(jid || '')] = Date.now();
    save();
}

const bare = (x) => String(x || '').split(':')[0].split('@')[0];

/** Checks the GROUPS for real. Returns { ok, missingGroups }. */
async function verifyGroups(sock, jid) {
    const missing = [];
    for (const g of GROUPS) {
        try {
            const meta = await sock.groupMetadata(g);
            const member = (meta.participants || []).some((p) => bare(p.id) === bare(jid));
            if (!member) missing.push(meta.subject || g);
        } catch (_) {
            // bot is not in this group, so it cannot check: skip it and log it
            console.error('[JOIN GATE] bot is not a member of group, cannot check:', g);
        }
    }
    return { ok: missing.length === 0, missingGroups: missing };
}

function prompt() {
    let t = `🔒 *Almost there!*\n\n`;
    if (CHANNELS.length) {
        t += `📢 *Follow our channels:*\n`;
        CHANNELS.forEach((c, i) => { t += `${i + 1}. ${c}\n`; });
        t += `\n`;
    }
    if (GROUPS.length) {
        t += `👥 *Join our groups* (the bot checks this)\n\n`;
    }
    t += `After you follow the channels${GROUPS.length ? ' and join the groups' : ''}, type *.joined* to unlock all commands.`;
    return t;
}

function missingText(missingGroups) {
    return `❌ *Not yet.*\n\nYou still need to join:\n` +
        missingGroups.map((g) => `• ${g}`).join('\n') +
        `\n\nJoin them, then type *.joined* again.`;
}

module.exports = { enabled, isJoined, markJoined, prompt, verifyGroups, missingText, CHANNELS, GROUPS, _channelName: CHANNEL_NAME };
