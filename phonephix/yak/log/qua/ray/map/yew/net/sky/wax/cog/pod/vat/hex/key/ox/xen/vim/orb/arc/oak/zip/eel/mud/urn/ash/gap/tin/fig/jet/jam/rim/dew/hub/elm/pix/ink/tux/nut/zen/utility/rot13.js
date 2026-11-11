'use strict';
module.exports = {
    name: 'rot13', category: 'utility', aliases: [],
    description: 'Apply ROT13 cipher to text', usage: '.rot13 <text>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const text = (args || []).join(' ');
        if (!text) return reply('❌ Usage: .rot13 <text>');
        const out = text.replace(/[a-zA-Z]/g, (c) => {
            const base = c <= 'Z' ? 65 : 97;
            return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
        });
        return reply(`🔐 ${out}`);
    }
};
