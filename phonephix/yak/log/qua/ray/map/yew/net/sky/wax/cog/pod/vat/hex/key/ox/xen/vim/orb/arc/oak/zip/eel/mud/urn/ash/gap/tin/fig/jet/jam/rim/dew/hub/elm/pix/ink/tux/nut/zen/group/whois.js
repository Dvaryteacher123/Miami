'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'whois',
    aliases: ['userinfo', 'memberinfo'],
    description: '🔎 Member info (mention/reply, or yourself)',
    usage: 'whois [@user]',
    cooldown: 5,
    async run({ resolveTarget, ctx, sock, parts, partId, num, send, reply }) {
        let t = resolveTarget();
        if (!t) {
            const me = num(ctx.senderJid) || num(ctx.senderPhone);
            const part = parts.find((p) => num(partId(p)) === me);
            t = part ? { jid: partId(part), phone: me, part, isAdmin: part.admin === 'admin' || part.admin === 'superadmin', isCreator: part.admin === 'superadmin' } : null;
        }
        if (!t || !t.part) return reply('❌ That person is not in this group.');

        const role = t.isCreator ? 'Creator 👑' : t.isAdmin ? 'Admin 🛡️' : 'Member 👤';
        const caption =
            `🔎 *WHOIS*\n\n` +
            `Tag: @${num(t.jid)}\n` +
            `Number: +${num(t.jid)}\n` +
            `Role: ${role}\n` +
            `Chat: wa.me/${num(t.jid)}`;

        let url = null;
        try { url = await sock.profilePictureUrl(t.jid, 'image'); } catch (_) { /* no picture */ }
        if (url) return send({ image: { url }, caption, mentions: [t.jid] });
        return reply(caption, [t.jid]);
    }
});
