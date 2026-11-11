'use strict';

module.exports = {
    name: 'repeat',
    category: 'general',
    aliases: ['say', 'echo'],
    description: 'Repeat any text',
    usage: '.repeat <text>',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const text = String(ctx.args?.join(' ') || '').trim();

        if (!text) {
            return ctx.sock.sendMessage(
                ctx.from,
                {
                    text: `❌ Usage: ${ctx.prefix || '.'}repeat <text>`
                },
                { quoted: ctx.msg }
            );
        }

        return ctx.sock.sendMessage(
            ctx.from,
            { text },
            { quoted: ctx.msg }
        );
    }
};
