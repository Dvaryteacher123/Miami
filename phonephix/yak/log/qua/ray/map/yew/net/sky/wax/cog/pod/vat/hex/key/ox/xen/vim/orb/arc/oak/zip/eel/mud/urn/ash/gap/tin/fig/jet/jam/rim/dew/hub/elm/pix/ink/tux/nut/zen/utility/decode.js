'use strict';

module.exports = {
    name: 'decode',
    category: 'utility',
    aliases: ['urldecode'],
    description: 'Decode URL-encoded text',
    usage: '.decode hello%20world',
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
            const text = Array.isArray(ctx.args)
                ? ctx.args.join(' ')
                : '';

            if (!text.trim()) {
                return reply(
                    '❌ Please provide encoded text.\n\n' +
                    'Example:\n' +
                    '`.decode hello%20world`'
                );
            }

            const decoded = decodeURIComponent(text);

            return reply(
                `🔓 *URL DECODE*\n\n` +
                `🔑 Encoded:\n${text}\n\n` +
                `📝 Result:\n${decoded}`
            );

        } catch (error) {
            console.error('[DECODE ERROR]', error);

            return reply(
                '❌ Invalid encoded text.'
            );
        }
    }
};
