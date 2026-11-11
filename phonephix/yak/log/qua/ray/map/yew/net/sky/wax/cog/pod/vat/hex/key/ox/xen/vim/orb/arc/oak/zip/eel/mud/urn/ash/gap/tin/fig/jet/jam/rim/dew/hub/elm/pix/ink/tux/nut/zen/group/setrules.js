'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'setrules',
    aliases: ['setsheria'],
    description: '📜 Set the group rules',
    usage: 'setrules <rules>',
    admin: true,
    async run({ raw, store, reply, prefix }) {
        if (!raw) return reply(`❌ Enter the rules.\n\nExample:\n${prefix}setrules 1. Respect everyone\n2. No spam`);
        const { gs, save } = await store();
        gs.rules = raw.slice(0, 3000);
        await save();
        return reply(`✅ Rules saved. Use *${prefix}rules* to view them.`);
    }
});
