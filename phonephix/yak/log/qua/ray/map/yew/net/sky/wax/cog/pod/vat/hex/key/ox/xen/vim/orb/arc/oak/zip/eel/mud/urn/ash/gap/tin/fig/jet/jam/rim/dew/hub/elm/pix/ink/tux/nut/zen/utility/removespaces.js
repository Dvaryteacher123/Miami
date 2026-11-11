'use strict';
module.exports = {
    name: 'removespaces',
    category: 'utility',
    aliases: ['nospace'],
    description: 'Remove all whitespace from a text',
    usage: '.removespaces <text>',
    ownerOnly: false,
    cooldown: 5,
    async execute(ctx) {
        const reply = (t) => ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });
        const content = String(ctx.args?.join(' ') || '').trim();
        if (!content) return reply(`❌ Usage: ${ctx.prefix || '.'}removespaces <text>`);
        return reply(`🧹 *NO SPACES*\n\n${content.replace(/\s+/g, '')}`);
    }
};
