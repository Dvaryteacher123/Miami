'use strict';

/**
 * ANTIDELETE - when someone deletes a message, the bot sends the ORIGINAL to the
 * bot owner's private chat. Only the owner sees it. Turn on with .antidelete on.
 * Messages are kept in memory for a short time only (not saved to disk).
 */

const MAX_ITEMS = Number(process.env.ANTIDELETE_CACHE) || 5000;
const TTL_MS = (Number(process.env.ANTIDELETE_HOURS) || 6) * 3600 * 1000;
const cache = new Map(); // message id -> { jid, msg, at }

const REVOKE_TYPE = 0; // WhatsApp protocol: a "message deleted" event

function bareJid(jid) {
    return String(jid || '').split(':')[0].split('@')[0] + '@' + String(jid || '').split('@')[1];
}

function remember(msg, from) {
    const id = msg?.key?.id;
    if (!id || !msg.message) return;
    if (msg.message.protocolMessage || msg.message.reactionMessage) return;

    cache.set(id, { from, msg, at: Date.now() });

    if (cache.size > MAX_ITEMS) {
        const oldest = cache.keys().next().value;
        cache.delete(oldest);
    }
}

function purge() {
    const now = Date.now();
    for (const [id, v] of cache) {
        if (now - v.at > TTL_MS) cache.delete(id);
    }
}

function textOf(m) {
    return m?.conversation || m?.extendedTextMessage?.text || m?.imageMessage?.caption ||
        m?.videoMessage?.caption || m?.documentMessage?.caption || '';
}

/** Called for every incoming message. Returns true if it handled a deletion. */
async function onMessage({ sock, msg, from, isGroup, senderJid, enabled, mode }) {
    if (!enabled || !sock) return false;

    const proto = msg?.message?.protocolMessage;
    if (proto && proto.type === REVOKE_TYPE && proto.key?.id) {
        const original = cache.get(proto.key.id);
        if (!original) return false;
        if (original.msg.key?.fromMe) return false; // your own deletions are not reported

        // mode "chat" = repost in the same chat, otherwise (default) send privately to the owner
        const owner = mode === 'chat' ? original.from : bareJid(sock.user?.id);
        if (!owner || owner.startsWith('undefined')) return false;

        const who = original.msg.pushName || String(original.msg.key?.participant || original.from).split('@')[0];
        const where = String(original.from).endsWith('@g.us') ? 'group' : 'private chat';
        const body = textOf(original.msg.message);

        try {
            await sock.sendMessage(owner, {
                text: `🗑️ *DELETED MESSAGE*\n\n👤 From: ${who}\n📍 Where: ${where}\n` +
                      (body ? `\n💬 ${body}` : '\n📎 Media below:')
            });
            if (!body) {
                await sock.sendMessage(owner, { forward: original.msg });
            }
        } catch (e) {
            console.error('[ANTIDELETE] send failed:', e && e.message ? e.message : e);
        }
        cache.delete(proto.key.id);
        return true;
    }

    remember(msg, from);
    if (cache.size % 200 === 0) purge();
    return false;
}

module.exports = { onMessage, remember, _cache: cache };
