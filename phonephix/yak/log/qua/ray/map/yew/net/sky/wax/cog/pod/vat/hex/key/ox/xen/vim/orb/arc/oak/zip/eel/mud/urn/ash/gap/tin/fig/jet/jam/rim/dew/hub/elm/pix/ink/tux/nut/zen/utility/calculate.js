'use strict';

module.exports = {
    name: 'calc',
    category: 'utility',
    aliases: ['calculate', 'math'],
    description: 'Calculate a mathematical expression',
    usage: '.calc 25 * 4 + 10',
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
            const expression = Array.isArray(ctx.args)
                ? ctx.args.join(' ').trim()
                : '';

            if (!expression) {
                return reply(
                    '❌ Weka calculation.\n\n' +
                    'Mfano:\n' +
                    '`.calc 25 * 4 + 10`'
                );
            }

            /*
             * Ruhusu namba na operators za msingi tu.
             * Hairuhusu letters, functions au JS code.
             */
            if (!/^[0-9+\-*/().%\s]+$/.test(expression)) {
                return reply(
                    '❌ Calculation ina characters zisizoruhusiwa.'
                );
            }

            if (expression.length > 100) {
                return reply('❌ Expression ni ndefu sana.');
            }

            const result = Function(
                `"use strict"; return (${expression})`
            )();

            if (
                typeof result !== 'number' ||
                !Number.isFinite(result)
            ) {
                return reply('❌ The calculation did not return a valid result.');
            }

            return reply(
                `🧮 *CALCULATOR*\n\n` +
                `📌 ${expression}\n` +
                `━━━━━━━━━━━━\n` +
                `✅ *${result}*`
            );

        } catch (error) {
            console.error('[CALC ERROR]', error);
            return reply(
                '❌ Could not calculate. Check that the expression is valid.'
            );
        }
    }
};
