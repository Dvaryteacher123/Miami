'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'resetwarn',
    aliases: ['clearwarn', 'resetwarns'],
    description: '🧹 Clear warnings for one member or everyone (all)',
    usage: 'resetwarn @user | resetwarn all',
    admin: true,
    async run({ args, resolveTarget, store, reply, num, prefix }) {
        const { gs, save } = await store();
        if (String(args[0] || '').toLowerCase() === 'all') {
            gs.warns = {};
            await save();
            return reply('✅ Warnings for *everyone* cleared.');
        }
        const t = resolveTarget({ allowNumber: false });
        if (!t) return reply(`❌ Mention or reply to a member, or use *${prefix}resetwarn all*`);
        if (gs.warns) delete gs.warns[t.phone];
        await save();
        return reply(`✅ Warnings for @${num(t.jid)} cleared.`, [t.jid]);
    }
});
