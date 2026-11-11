'use strict';

module.exports = {
    name: 'close',
    category: 'group',
    aliases: ['lock'],
    description: 'Close the group for members',
    usage: '.close',
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
                'announcement'
            );

            return reply(
                `🔒 *GROUP CLOSED*\n\n` +
                `Only group admins can send messages now.`
            );

        } catch (error) {
            console.error('[CLOSE ERROR]', error);

            return reply(
                `❌ Failed to close the group.\n\n${error?.message || error}`
            );
        }
    }
};
