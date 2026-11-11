'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'setwarnlimit',
    aliases: ['warnlimit'],
    description: '⚠️ Set how many warnings before a member is removed (1-10)',
    usage: 'setwarnlimit <number>',
    admin: true,
    async run({ args, store, reply, prefix }) {
        const n = parseInt(args[0], 10);
        if (!Number.isInteger(n) || n < 1 || n > 10) return reply(`❌ Enter a number between 1 and 10.\n\nExample: ${prefix}setwarnlimit 3`);
        const { gs, save } = await store();
        gs.warnLimit = n;
        await save();
        return reply(`✅ Members will be removed at *${n}* warnings.`);
    }
});
