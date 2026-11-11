'use strict';
module.exports = {
    name: 'ascii',
    category: 'utility',
    aliases: ['charcode'],
    description: 'Show the ASCII code(s) for a character or word',
    usage: '.ascii <text>',
    ownerOnly: false,
    cooldown: 5,
    async execute(ctx) {
        const reply = (t) => ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });
        const content = String(ctx.args?.join(' ') || '').trim();
        if (!content) return reply(`❌ Usage: ${ctx.prefix || '.'}ascii <text>`);
        const codes = content.split('').map(c => `${c} = ${c.charCodeAt(0)}`).join('\n');
        return reply(`🔢 *ASCII CODES*\n\n${codes}`);
    }
};
