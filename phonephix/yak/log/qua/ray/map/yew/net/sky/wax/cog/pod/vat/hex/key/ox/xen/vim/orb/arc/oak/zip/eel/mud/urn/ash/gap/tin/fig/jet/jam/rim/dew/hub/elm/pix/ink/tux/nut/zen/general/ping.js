'use strict';

module.exports = {
    name: 'ping',
    category: 'general',

    aliases: ['p'],

    description: 'Check bot response speed',
    usage: '.ping',

    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {

        try {
            const start = Date.now();

            await ctx.sock.sendMessage(
                ctx.from,
                {
                    text: '🏓 *Pinging...*'
                },
                {
                    quoted: ctx.msg
                }
            );

            const latency =
                Date.now() - start;

            await ctx.sock.sendMessage(
                ctx.from,
                {
                    text:
                        `🏓 *PONG!*\n\n` +
                        `⚡ Response: *${latency}ms*\n` +
                        `🤖 PHONEPHIX BOT`
                },
                {
                    quoted: ctx.msg
                }
            );

        } catch (error) {
            console.error(
                '[PING ERROR]',
                error
            );
        }
    }
};
