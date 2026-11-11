'use strict';
module.exports = {
    name: 'atbash',
    category: 'utility',
    aliases: [],
    description: 'Encode/decode text using the Atbash cipher',
    usage: '.atbash <text>',
    ownerOnly: false,
    cooldown: 5,
    async execute(ctx) {
        const reply = (t) => ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });
        const content = String(ctx.args?.join(' ') || '').trim();
        if (!content) return reply(`❌ Usage: ${ctx.prefix || '.'}atbash <text>`);
        const out = content.replace(/[a-zA-Z]/g, (c) => {
            const isUpper = c === c.toUpperCase();
            const base = isUpper ? 65 : 97;
            const idx = c.toUpperCase().charCodeAt(0) - 65;
            const flipped = 25 - idx;
            return String.fromCharCode(base + flipped);
        });
        return reply(`🔐 *ATBASH*\n\n${out}`);
    }
};
