'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'setwelcome',
    emoji: '💬',
    aliases: ['setwelcometext'],
    description: '💬 Set a custom welcome message (use {user} {group} {count})',
    usage: 'setwelcome <text>  |  setwelcome reset',
    admin: true,
    cooldown: 4,
    async run({ store, raw, reply, prefix }) {
        const { gs, save } = await store();
        if (!raw) {
            return reply(
                `💬 *SETWELCOME*\n\n` +
                `Write your message. You can use:\n` +
                `• {user} — mentions the member\n` +
                `• {group} — group name\n` +
                `• {count} — member count\n\n` +
                `Example:\n${prefix}setwelcome Hello {user}, welcome to {group}! 🎉\n\n` +
                `Reset to default: ${prefix}setwelcome reset\n` +
                `Turn on/off: ${prefix}welcome on|off`
            );
        }
        if (raw.toLowerCase() === 'reset') {
            delete gs.welcomeText;
            await save();
            return reply('♻️ Back to the default message ✅');
        }
        gs.welcomeText = raw.slice(0, 1000);
        await save();
        return reply(`💬 Saved ✅\n\nRemember to enable it with *${prefix}welcome on* 🟢`);
    }
});
