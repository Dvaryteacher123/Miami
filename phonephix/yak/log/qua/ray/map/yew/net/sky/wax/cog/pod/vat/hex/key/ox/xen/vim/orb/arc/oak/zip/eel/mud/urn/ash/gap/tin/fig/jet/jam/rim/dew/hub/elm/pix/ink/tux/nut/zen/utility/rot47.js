'use strict';
module.exports = {
    name: 'rot47',
    category: 'utility',
    aliases: ['r47'],
    description: 'Encode/decode text using ROT47 cipher',
    usage: '.rot47 <text>',
    ownerOnly: false,
    cooldown: 5,
    async execute(ctx) {
        const reply = (t) => ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });
        const content = String(ctx.args?.join(' ') || '').trim();
        if (!content) return reply(`❌ Usage: ${ctx.prefix || '.'}rot47 <text>`);
        const out = content.replace(/[!-~]/g, (c) => {
            const code = c.charCodeAt(0);
            return String.fromCharCode(33 + ((code + 14) % 94));
        });
        return reply(`🔐 *ROT47*\n\n${out}`);
    }
};
