'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'unblacklist',
    emoji: '✅',
    aliases: ['unban', 'removeblacklist'],
    description: '✅ Remove a number from the blacklist',
    usage: 'unblacklist 2557xxxxxxxx',
    admin: true,
    cooldown: 4,
    async run({ store, args, reply, prefix }) {
        const digits = String(args[0] || '').replace(/\D/g, '');
        if (digits.length < 7) return reply(`❌ Type the number ✅\n\nExample: ${prefix}unblacklist 255712345678`);
        const { gs, save } = await store();
        const list = Array.isArray(gs.blacklist) ? gs.blacklist : [];
        if (!list.includes(digits)) return reply('❌ That number is not on the blacklist 🔍');
        gs.blacklist = list.filter((p) => p !== digits);
        await save();
        return reply(`✅ +${digits} was removed from the blacklist.`);
    }
});
