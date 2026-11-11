'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

const DEFAULT_LIMIT = Number(process.env.WARN_LIMIT) || 3;

module.exports = defineGroup({
    name: 'warn',
    aliases: ['onya', 'warnuser'],
    description: '⚠️ Warn a member (removed when the limit is reached)',
    usage: 'warn @user [reason]',
    admin: true,
    async run({ sock, from, resolveTarget, store, rest, reply, num, botIsAdmin, prefix }) {
        const t = resolveTarget({ allowNumber: false });
        if (!t) return reply(`❌ Mention or reply to a member.\n\nExample: ${prefix}warn @user spam`);
        if (t.isBot) return reply('❌ I can\'t warn myself 😄');
        if (t.isAdmin) return reply('❌ You cannot warn an admin.');
        if (!t.part) return reply('❌ That person is not in this group.');

        const { gs, save } = await store();
        if (!gs.warns || typeof gs.warns !== 'object') gs.warns = {};
        const limit = Number(gs.warnLimit) || DEFAULT_LIMIT;
        const count = (Number(gs.warns[t.phone]) || 0) + 1;
        const reason = rest ? `\n📝 Reason: ${rest}` : '';

        if (count >= limit) {
            delete gs.warns[t.phone];
            await save();
            if (botIsAdmin) {
                await reply(`🚫 @${num(t.jid)} reached *${limit}/${limit}* warnings and is being removed.${reason}`, [t.jid]);
                await sock.groupParticipantsUpdate(from, [t.jid], 'remove');
                return;
            }
            return reply(`🚫 @${num(t.jid)} reached *${limit}/${limit}* warnings.\n⚠️ Make me an admin so I can remove them.${reason}`, [t.jid]);
        }

        gs.warns[t.phone] = count;
        await save();
        return reply(`⚠️ *WARNING* @${num(t.jid)}\n\nWarning: *${count}/${limit}*${reason}`, [t.jid]);
    }
});
