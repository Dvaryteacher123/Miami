'use strict';

const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'antibadword',
    aliases: ['antibad', 'badwordfilter'],
    description: '🚫 Delete messages that contain banned words',
    usage: 'antibadword on/off',
    emoji: '🚫',
    admin: true,
    meta: true,
    async run({ args, reply, store, prefix, botIsAdmin }) {
        const { gs, save } = await store();
        const a = String(args[0] || '').toLowerCase();

        if (a === 'on' || a === 'off') {
            gs.antibadword = a === 'on';
            await save();
            if (a === 'off') return reply('🚫 *ANTIBADWORD* 🔴 OFF');
            const count = (gs.badwords || []).length;
            return reply(
                '🚫 *ANTIBADWORD* 🟢 ON\n\n' +
                (count ? `Banned words: ${count}\n` : `No words yet. Add some: ${prefix}addbadword word1 word2\n`) +
                (botIsAdmin ? '' : '\n⚠️ Make me a group *admin* so I can delete the messages.')
            );
        }

        return reply(
            `🚫 *ANTIBADWORD*\n\nStatus: ${gs.antibadword ? '🟢 ON' : '🔴 OFF'}\nWords: ${(gs.badwords || []).length}\n\n` +
            `• ${prefix}antibadword on / off\n• ${prefix}addbadword <words>\n• ${prefix}delbadword <word>\n• ${prefix}badwords`
        );
    }
});
