'use strict';

/**
 * Small per-session features driven by settings.metadata:
 *   autoread     - mark every incoming message as read (blue ticks)
 *   alwaysonline - keep the account showing "online"
 *   autorecord   - show "recording audio..." when someone messages
 *   anticall     - reject incoming calls (+ optional message)
 *   groups[jid].antibadword + groups[jid].badwords - delete messages with bad words
 *
 * Turn them on with the commands: .autoread  .alwaysonline  .autorecord  .anticall  .antibadword
 */

const lastOnline = new WeakMap(); // sock -> timestamp

const escapeRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const num = (jid) => String(jid || '').split(':')[0].split('@')[0].replace(/[^\d]/g, '');

function badWordRegex(words) {
    const list = (words || []).map((w) => String(w).trim()).filter(Boolean).map(escapeRe);
    if (!list.length) return null;
    // letters/digits around the word must not be part of a longer word
    return new RegExp(`(^|[^\\p{L}\\p{N}])(${list.join('|')})(?=$|[^\\p{L}\\p{N}])`, 'iu');
}

const regexCache = new Map(); // key -> { sig, re }

function regexFor(groupJid, words) {
    const sig = (words || []).join('|');
    const hit = regexCache.get(groupJid);
    if (hit && hit.sig === sig) return hit.re;
    const re = badWordRegex(words);
    regexCache.set(groupJid, { sig, re });
    if (regexCache.size > 2000) regexCache.clear();
    return re;
}

/** Returns true when the message was handled (e.g. deleted) and processing must stop. */
async function onMessage({ sock, store, msg, from, isGroup, senderJid, settings }) {
    const md = (settings && settings.metadata) || {};
    if (!sock || !msg || !msg.key) return false;
    const fromMe = msg.key.fromMe === true;
    const isChannel = String(from).endsWith('@newsletter');

    /* ALWAYS ONLINE (at most once per 45 seconds) */
    if (md.alwaysonline === true && typeof sock.sendPresenceUpdate === 'function') {
        const now = Date.now();
        if (now - (lastOnline.get(sock) || 0) > 45000) {
            lastOnline.set(sock, now);
            sock.sendPresenceUpdate('available').catch(() => {});
        }
    }

    /* AUTOREAD */
    if (md.autoread === true && !fromMe && !isChannel && typeof sock.readMessages === 'function') {
        sock.readMessages([msg.key]).catch(() => {});
    }

    /* AUTORECORD */
    if (md.autorecord === true && !fromMe && !isChannel && typeof sock.sendPresenceUpdate === 'function') {
        sock.sendPresenceUpdate('recording', from).catch(() => {});
        const t = setTimeout(() => sock.sendPresenceUpdate('paused', from).catch(() => {}), 4000);
        if (t.unref) t.unref();
    }

    /* ANTIBADWORD (groups) */
    if (isGroup && !fromMe) {
        const gs = md.groups && md.groups[from];
        if (gs && gs.antibadword === true && Array.isArray(gs.badwords) && gs.badwords.length) {
            const { extractText, isGroupAdmin, isBotGroupAdmin } = require('../bot/messages');
            const body = String(extractText(msg) || '');
            if (!body) return false;

            const re = regexFor(from, gs.badwords);
            if (!re || !re.test(body)) return false;

            // admins and the bot owner may say anything
            if (num(senderJid) && num(senderJid) === num(sock.user && sock.user.id)) return false;
            try { if (await isGroupAdmin(sock, store, from, senderJid)) return false; } catch (_) {}

            let canDelete = false;
            try { canDelete = await isBotGroupAdmin(sock, store, from); } catch (_) {}
            if (!canDelete) return false;

            try { await sock.sendMessage(from, { delete: msg.key }); } catch (_) {}
            try {
                await sock.sendMessage(from, {
                    text: `🚫 @${num(senderJid)} bad words are not allowed here.`,
                    mentions: [senderJid]
                });
            } catch (_) {}
            return true;
        }
    }

    return false;
}

/** Incoming call: reject it when .anticall is on. */
async function onCall({ sock, sessionId, userId, calls }) {
    if (!sock || !Array.isArray(calls) || !calls.length) return;

    let md = {};
    try {
        const Setting = require('../database/models/Setting');
        const s = await Setting.getOrCreate(sessionId, userId);
        md = (s && s.metadata) || {};
    } catch (_) { return; }

    if (md.anticall !== true) return;

    for (const call of calls) {
        if (!call || call.status !== 'offer' || !call.id || !call.from) continue;
        try {
            if (typeof sock.rejectCall === 'function') await sock.rejectCall(call.id, call.from);
        } catch (_) {}
        try {
            const text = md.anticallMsg ||
                '📵 Sorry, calls are not accepted on this number. Please send a message instead.';
            await sock.sendMessage(call.from, { text });
        } catch (_) {}
    }
}

module.exports = { onMessage, onCall };
