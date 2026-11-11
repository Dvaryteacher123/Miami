'use strict';
module.exports = {
    name: 'texttobinary',
    category: 'utility',
    aliases: ['text2bin'],
    description: 'Convert text into binary code',
    usage: '.texttobinary <text>',
    ownerOnly: false,
    cooldown: 5,
    async execute(ctx) {
        const reply = (t) => ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });
        const content = String(ctx.args?.join(' ') || '').trim();
        if (!content) return reply(`❌ Usage: ${ctx.prefix || '.'}texttobinary <text>`);
        const bin = content.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
        return reply(`🔤 *TEXT → BINARY*\n\n${bin}`);
    }
};
