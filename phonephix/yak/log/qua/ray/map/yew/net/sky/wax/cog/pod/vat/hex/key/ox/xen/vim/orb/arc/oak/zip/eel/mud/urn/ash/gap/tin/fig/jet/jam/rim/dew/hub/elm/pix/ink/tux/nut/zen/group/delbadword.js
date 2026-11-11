'use strict';

const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'delbadword',
    aliases: ['removebadword', 'delbad'],
    description: '➖ Remove a banned word (or "all")',
    usage: 'delbadword <word|all>',
    emoji: '➖',
    admin: true,
    async run({ args, reply, store, prefix }) {
        if (!args.length) return reply(`❌ Usage: ${prefix}delbadword <word|all>`);

        const { gs, save } = await store();
        if (String(args[0]).toLowerCase() === 'all') {
            gs.badwords = [];
            await save();
            return reply('✅ All banned words removed.');
        }

        const drop = args.map((w) => w.toLowerCase().trim());
        const before = (gs.badwords || []).length;
        gs.badwords = (gs.badwords || []).filter((w) => !drop.includes(w));
        await save();
        return reply(before === gs.badwords.length ? '❌ Word not found in the list.' : `✅ Removed. ${gs.badwords.length} word(s) left.`);
    }
});
