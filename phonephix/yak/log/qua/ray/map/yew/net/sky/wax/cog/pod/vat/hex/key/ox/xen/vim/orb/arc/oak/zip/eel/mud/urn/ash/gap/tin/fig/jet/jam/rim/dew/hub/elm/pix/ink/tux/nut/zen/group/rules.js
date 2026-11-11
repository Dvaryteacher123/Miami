'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'rules',
    aliases: ['sheria', 'grouprules'],
    description: '📜 Show the group rules',
    async run({ meta, store, reply, prefix }) {
        const { gs } = await store();
        if (!gs.rules) return reply(`📜 This group has no rules yet.\nAn admin can use *${prefix}setrules*`);
        return reply(`📜 *RULES - ${meta.subject}*\n\n${gs.rules}`);
    }
});
