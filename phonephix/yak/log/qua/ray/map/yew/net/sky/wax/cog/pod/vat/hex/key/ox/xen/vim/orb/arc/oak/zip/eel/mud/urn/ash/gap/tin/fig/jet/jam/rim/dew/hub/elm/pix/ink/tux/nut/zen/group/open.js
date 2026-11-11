'use strict';

module.exports = {
    name: 'open',
    category: 'group',
    aliases: ['unlock'],
    description: 'Open the group for all members',
    usage: '.open',
    ownerOnly: false,
    cooldown: 5,

    async execute(ctx) {
        const reply = async (text) => {
            await ctx.sock.sendMessage(
                ctx.from,
                { text: String(text) },
                { quoted: ctx.msg }
            );
        };

        try {
            if (!ctx.isGroup) {
                return reply('❌ This command can only be used in a group.');
            }

            await ctx.sock.groupSettingUpdate(
                ctx.from,
                'not_announcement'
            );

            return reply(
                `🔓 *GROUP OPENED*\n\n` +
                `✅ All members can now send messages.`
            );

        } catch (error) {
            console.error('[OPEN ERROR]', error);

            return reply(
                `❌ Failed to open the group.\n\n${error?.message || error}`
            );
        }
    }
};
