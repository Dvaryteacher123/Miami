'use strict';

module.exports = {
    name: 'base64',
    category: 'utility',
    aliases: ['b64'],
    description: 'Encode text to Base64',
    usage: '.base64 hello world',
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
                    '`.base64 hello world`'
                );
            }

            const encoded = Buffer
                .from(text, 'utf8')
                .toString('base64');

            return reply(
                `🔐 *BASE64 ENCODE*\n\n` +
                `📝 Input:\n${text}\n\n` +
                `🔑 Encoded:\n${encoded}`
            );

        } catch (error) {
            console.error('[BASE64 ERROR]', error);

            return reply(
                `❌ Encoding failed.\n\n${error?.message || error}`
            );
        }
    }
};
