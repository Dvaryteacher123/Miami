'use strict';

module.exports = {
    name: 'encode',
    category: 'utility',
    aliases: ['urlencode'],
    description: 'Encode text for use in URLs',
    usage: '.encode hello world',
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
                    '❌ Please provide text to encode.\n\n' +
                    'Example:\n' +
                    '`.encode hello world`'
                );
            }

            const encoded = encodeURIComponent(text);

            return reply(
                `🔐 *URL ENCODE*\n\n` +
                `📝 Input:\n${text}\n\n` +
                `🔑 Encoded:\n${encoded}`
            );

        } catch (error) {
            console.error('[ENCODE ERROR]', error);

            return reply(
                `❌ Encoding failed.\n\n${error?.message || error}`
            );
        }
    }
};
