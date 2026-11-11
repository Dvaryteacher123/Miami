'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'isadmin',
    aliases: ['checkadmin'],
    description: '🛡️ Check whether someone is an admin (mention/reply, or yourself)',
    usage: 'isadmin [@user]',
    async run({ resolveTarget, ctx, parts, partId, num, reply }) {
        let t = resolveTarget();
        if (!t) {
            const me = num(ctx.senderJid) || num(ctx.senderPhone);
            const part = parts.find((p) => num(partId(p)) === me);
            t = part ? { jid: partId(part), part, isAdmin: part.admin === 'admin' || part.admin === 'superadmin', isCreator: part.admin === 'superadmin' } : null;
        }
        if (!t || !t.part) return reply('❌ That person is not in this group.');
        const role = t.isCreator ? '👑 Creator (superadmin)' : t.isAdmin ? '🛡️ Admin' : '👤 Regular member';
        return reply(`@${num(t.jid)} is: ${role}`, [t.jid]);
    }
});
