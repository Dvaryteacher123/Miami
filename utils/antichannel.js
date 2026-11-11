'use strict';

/**
 * ANTICHANNEL - deletes messages that were FORWARDED from a WhatsApp channel
 * (newsletter) in groups where it is ON. Admins are not affected.
 * Turn on per group with .antichannel on
 */

const MEDIA_KEYS = [
    'extendedTextMessage', 'imageMessage', 'videoMessage', 'documentMessage',
    'audioMessage', 'stickerMessage', 'contactMessage', 'locationMessage'
];

function contextOf(msg) {
    const m = msg?.message || {};
    for (const k of MEDIA_KEYS) {
        if (m[k]?.contextInfo) return m[k].contextInfo;
    }
    return null;
}

function isFromChannel(msg) {
    const ctx = contextOf(msg);
    if (ctx?.forwardedNewsletterMessageInfo) return true;
    // a message that came straight from a channel
    return String(msg?.key?.remoteJid || '').endsWith('@newsletter');
}

async function isAdmin(sock, groupJid, jid) {
    try {
        const meta = await sock.groupMetadata(groupJid);
        const bare = (x) => String(x || '').split(':')[0].split('@')[0];
        const p = (meta.participants || []).find((x) => bare(x.id) === bare(jid));
        return !!p && (p.admin === 'admin' || p.admin === 'superadmin');
    } catch (_) {
        return true; // unknown -> do not delete
    }
}

/** Returns true when the message was handled (deleted), so normal processing stops. */
async function handle({ sock, msg, from, senderJid, isGroup, enabled }) {
    if (!enabled || !isGroup || !sock || !msg?.key) return false;
    if (msg.key.fromMe) return false;
    if (!isFromChannel(msg)) return false;
    if (await isAdmin(sock, from, senderJid || msg.key.participant)) return false;

    try {
        await sock.sendMessage(from, { delete: msg.key });
    } catch (e) {
        console.error('[ANTICHANNEL] delete failed:', e && e.message ? e.message : e);
        return false; // bot is not admin, so it cannot delete; let normal flow continue
    }

    const who = String(senderJid || msg.key.participant || '').split('@')[0];
    try {
        await sock.sendMessage(from, {
            text: `🚫 @${who} channel forwards are not allowed in this group.`,
            mentions: [senderJid || msg.key.participant]
        });
    } catch (_) {}
    return true;
}

module.exports = { handle, isFromChannel };
