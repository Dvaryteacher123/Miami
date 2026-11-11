'use strict';

const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'addbadword',
    aliases: ['addbad'],
    description: '➕ Add banned words for this group',
    usage: 'addbadword <word1> <word2>',
    emoji: '➕',
    admin: true,
    async run({ args, reply, store, prefix }) {
        const words = args.map((w) => w.toLowerCase().trim()).filter((w) => w.length >= 2);
        if (!words.length) return reply(`❌ Usage: ${prefix}addbadword word1 word2`);

        const { gs, save } = await store();
        gs.badwords = [...new Set([...(gs.badwords || []), ...words])].slice(0, 200);
        await save();
        return reply(
            `✅ Added ${words.length} word(s). Total: ${gs.badwords.length}` +
            (gs.antibadword ? '' : `\n\nTurn the filter on: ${prefix}antibadword on`)
        );
    }
});
