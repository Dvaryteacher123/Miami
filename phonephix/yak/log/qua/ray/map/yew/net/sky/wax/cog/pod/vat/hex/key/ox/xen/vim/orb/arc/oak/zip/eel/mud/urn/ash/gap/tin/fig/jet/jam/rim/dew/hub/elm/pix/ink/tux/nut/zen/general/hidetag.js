'use strict';

module.exports = {
    name: 'hidetag',
    category: 'group',

    aliases: ['notify', 'silenttag'],

    description: 'Mention all members without displaying their names',
    usage: '.hidetag [message]',

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
                return reply(
                    '❌ This command can only be used in groups.'
                );
            }

            const metadata =
                await ctx.sock.groupMetadata(ctx.from);

            const participants =
                metadata?.participants || [];

            const mentions = participants
                .map(member => member?.id)
                .filter(Boolean);

            if (!mentions.length) {
                return reply(
                    '❌ No members found.'
                );
            }

            const message =
                ctx.args?.length
                    ? ctx.args.join(' ')
                    : '📢 Attention everyone!';

            await ctx.sock.sendMessage(
                ctx.from,
                {
                    text: message,
                    mentions
                },
                {
                    quoted: ctx.msg
                }
            );

        } catch (error) {
            console.error('[HIDETAG ERROR]', error);

            return reply(
                `❌ Failed to mention members.\n\n${error.message}`
            );
        }
    }
};
