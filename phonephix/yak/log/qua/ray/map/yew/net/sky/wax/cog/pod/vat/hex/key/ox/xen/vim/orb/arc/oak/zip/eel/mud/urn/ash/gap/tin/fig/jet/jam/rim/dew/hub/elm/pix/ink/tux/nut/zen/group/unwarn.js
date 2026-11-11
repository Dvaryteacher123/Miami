'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'unwarn',
    aliases: ['delwarn', 'removewarn'],
    description: '✅ Remove one warning from a member',
    usage: 'unwarn @user',
    admin: true,
    async run({ resolveTarget, store, reply, num, prefix }) {
        const t = resolveTarget({ allowNumber: false });
        if (!t) return reply(`❌ Mention or reply to a member.\n\nExample: ${prefix}unwarn @user`);
        const { gs, save } = await store();
        const current = Number(gs.warns && gs.warns[t.phone]) || 0;
        if (!current) return reply('✅ That member has no warnings.');
        if (current <= 1) delete gs.warns[t.phone]; else gs.warns[t.phone] = current - 1;
        await save();
        return reply(`✅ Warning removed for @${num(t.jid)}.\nNow: *${Math.max(current - 1, 0)}*`, [t.jid]);
    }
});
