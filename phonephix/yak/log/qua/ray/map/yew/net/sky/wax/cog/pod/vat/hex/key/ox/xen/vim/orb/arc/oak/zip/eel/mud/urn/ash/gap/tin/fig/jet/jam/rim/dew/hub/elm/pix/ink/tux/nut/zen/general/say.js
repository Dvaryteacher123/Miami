'use strict';

module.exports = {
    name: 'say',
    category: 'general',
    aliases: ['repeat'],
    description: 'Make the bot repeat your message',
    usage: '.say <message>',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const reply = async (text) => {
            await ctx.sock.sendMessage(
                ctx.from,
                { text: String(text) },
                { quoted: ctx.msg }
            );
        };

        try {
            const text = ctx.args?.join(' ').trim();

            if (!text) {
                return reply(
                    `❌ *Usage:* ${ctx.prefix || '.'}say <message>\n\n` +
                    `Example: ${ctx.prefix || '.'}say Hello everyone!`
                );
            }

            return reply(text);

        } catch (error) {
            console.error('[SAY ERROR]', error);

            return reply(
                `❌ Failed to execute the say command.\n\n${error?.message || error}`
            );
        }
    }
};
