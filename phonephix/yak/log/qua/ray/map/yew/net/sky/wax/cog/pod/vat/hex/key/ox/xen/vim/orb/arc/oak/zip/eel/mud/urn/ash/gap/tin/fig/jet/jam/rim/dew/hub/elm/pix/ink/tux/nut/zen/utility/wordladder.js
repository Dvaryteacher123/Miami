'use strict';
module.exports = {
    name: 'charat', category: 'utility', aliases: [],
    description: 'Get the character at a given position in text: .charat <pos> <text>', usage: '.charat 3 hello', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const pos = parseInt(args?.[0], 10);
        const text = (args || []).slice(1).join(' ');
        if (isNaN(pos) || !text || pos < 1 || pos > text.length) return reply('❌ Usage: .charat <position (1-based)> <text>');
        return reply(`🔤 Character at position ${pos}: "${text[pos - 1]}"`);
    }
};
