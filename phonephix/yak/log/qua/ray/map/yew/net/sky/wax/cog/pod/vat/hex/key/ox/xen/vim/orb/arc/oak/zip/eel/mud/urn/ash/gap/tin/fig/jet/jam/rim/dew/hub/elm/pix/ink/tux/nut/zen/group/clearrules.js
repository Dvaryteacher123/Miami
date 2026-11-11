'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'clearrules',
    emoji: '🧹',
    aliases: ['resetrules', 'deleterules'],
    description: '🧹 Delete all group rules',
    admin: true,
    cooldown: 5,
    async run({ store, reply }) {
        const { gs, save } = await store();
        if (!gs.rules) return reply('📜 This group has no rules to clear.');
        delete gs.rules;
        await save();
        return reply('🧹 All group rules were cleared ✅');
    }
});
