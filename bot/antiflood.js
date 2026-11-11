/**
 * =====================================================
 *  ANTI-FLOOD  (kinga ya spam ya commands)
 *  Mtu akipiga .menu mara nyingi kwa pigo, bot inajibu
 *  mara moja tu na kuzipuuza zingine. Hii inazuia
 *  WhatsApp kuona bot inatuma ujumbe kupita kiasi
 *  (sababu kubwa ya bot kukatika / kubaniwa).
 *  Owner wa bot hazuiwi.
 * =====================================================
 */

'use strict';

const WINDOW_MS = Number(process.env.FLOOD_WINDOW_MS) || 10000;
const MAX_IN_WINDOW = Number(process.env.FLOOD_MAX_COMMANDS) || 30;
const MAX_COOLDOWN_S = 10;
const NOTIFY_EVERY_MS = 15000;

const history = new Map();   // "session|sender"          -> [timestamps]
const cooldowns = new Map(); // "session|sender|command"  -> readyAt
const notified = new Map();  // "session|sender"          -> lastNoticeAt

function check(sessionId, senderJid, cmd, now = Date.now()) {
    const user = `${sessionId}|${senderJid}`;

    // ---- menu/help/ping/alive are instant: no cooldown at all ----
    const FREE = ['menu', 'help', 'commands', 'ping', 'alive', 'uptime', 'owner', 'bot'];
    if (cmd && FREE.includes(String(cmd.name).toLowerCase())) {
        cmd = { ...cmd, cooldown: 0 };
    }

    // ---- per-command cooldown (kwa sekunde, max 10) ----
    const cd = Math.min(Math.max(Number(cmd?.cooldown) || 0, 0), MAX_COOLDOWN_S) * 1000;
    const cdKey = `${user}|${cmd?.name}`;
    const readyAt = cooldowns.get(cdKey) || 0;

    if (cd > 0 && now < readyAt) {
        return verdict(user, now, Math.ceil((readyAt - now) / 1000));
    }

    // ---- flood ya jumla: commands nyingi kwa muda mfupi ----
    const list = (history.get(user) || []).filter((t) => now - t < WINDOW_MS);

    if (list.length >= MAX_IN_WINDOW) {
        history.set(user, list);
        return verdict(user, now, Math.ceil((WINDOW_MS - (now - list[0])) / 1000));
    }

    list.push(now);
    history.set(user, list);

    if (cd > 0) cooldowns.set(cdKey, now + cd);

    return { blocked: false };
}

function verdict(user, now, waitSeconds) {
    const last = notified.get(user) || 0;
    const notify = now - last > NOTIFY_EVERY_MS;
    if (notify) notified.set(user, now);
    return { blocked: true, notify, waitSeconds: Math.max(1, waitSeconds) };
}

// futa data ya zamani ili memory isikue
const sweeper = setInterval(() => {
    const now = Date.now();
    for (const [k, t] of cooldowns) if (t < now) cooldowns.delete(k);
    for (const [k, list] of history) {
        const fresh = list.filter((t) => now - t < WINDOW_MS);
        if (fresh.length) history.set(k, fresh);
        else history.delete(k);
    }
    for (const [k, t] of notified) if (now - t > NOTIFY_EVERY_MS * 4) notified.delete(k);
}, 60000);
if (sweeper.unref) sweeper.unref();

module.exports = { check };
