'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'setgoodbye',
    emoji: '👋',
    aliases: ['setgoodbyetext'],
    description: '👋 Set a custom goodbye message (use {user} {group} {count})',
    usage: 'setgoodbye <text>  |  setgoodbye reset',
    admin: true,
    cooldown: 4,
    async run({ store, raw, reply, prefix }) {
        const { gs, save } = await store();
        if (!raw) {
            return reply(
                `👋 *SETGOODBYE*\n\n` +
                `Write your message. You can use:\n` +
                `• {user} — mentions the member\n` +
                `• {group} — group name\n` +
                `• {count} — member count\n\n` +
                `Example:\n${prefix}setgoodbye Hello {user}, welcome to {group}! 🎉\n\n` +
                `Reset to default: ${prefix}setgoodbye reset\n` +
                `Turn on/off: ${prefix}goodbye on|off`
            );
        }
        if (raw.toLowerCase() === 'reset') {
            delete gs.goodbyeText;
            await save();
            return reply('♻️ Back to the default message ✅');
        }
        gs.goodbyeText = raw.slice(0, 1000);
        await save();
        return reply(`👋 Saved ✅\n\nRemember to enable it with *${prefix}goodbye on* 🟢`);
    }
});
