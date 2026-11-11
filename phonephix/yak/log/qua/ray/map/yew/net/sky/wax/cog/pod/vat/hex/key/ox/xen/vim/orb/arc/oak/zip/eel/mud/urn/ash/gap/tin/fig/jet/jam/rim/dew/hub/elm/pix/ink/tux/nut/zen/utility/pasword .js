'use strict';

const crypto = require('crypto');

module.exports = {
    name: 'password',
    category: 'utility',
    aliases: ['pass', 'genpass'],
    description: 'Generate a secure random password',
    usage: '.password 16',
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
            let length = Number(
                Array.isArray(ctx.args)
                    ? ctx.args[0]
                    : 16
            );

            if (!Number.isInteger(length)) {
                length = 16;
            }

            if (length < 8) {
                return reply(
                    '❌ Password length must be at least 8 characters.'
                );
            }

            if (length > 128) {
                return reply(
                    '❌ Password length cannot exceed 128 characters.'
                );
            }

            const lowercase = 'abcdefghijklmnopqrstuvwxyz';
            const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const numbers = '0123456789';
            const symbols = '!@#$%^&*()_+-=[]{}<>?';

            const all =
                lowercase +
                uppercase +
                numbers +
                symbols;

            const getRandom = (chars) => {
                return chars[
                    crypto.randomInt(0, chars.length)
                ];
            };

            let password =
                getRandom(lowercase) +
                getRandom(uppercase) +
                getRandom(numbers) +
                getRandom(symbols);

            while (password.length < length) {
                password += getRandom(all);
            }

            /*
             * Shuffle the generated password.
             */
            password = password
                .split('')
                .sort(() => crypto.randomInt(0, 2) * 2 - 1)
                .join('');

            return reply(
                `🔐 *SECURE PASSWORD*\n\n` +
                `🔑 Password:\n` +
                `\`${password}\`\n\n` +
                `📏 Length: ${length} characters\n` +
                `🛡️ Contains uppercase, lowercase, numbers and symbols.`
            );

        } catch (error) {
            console.error('[PASSWORD ERROR]', error);

            return reply(
                `❌ Password generation failed.\n\n${error?.message || error}`
            );
        }
    }
};
