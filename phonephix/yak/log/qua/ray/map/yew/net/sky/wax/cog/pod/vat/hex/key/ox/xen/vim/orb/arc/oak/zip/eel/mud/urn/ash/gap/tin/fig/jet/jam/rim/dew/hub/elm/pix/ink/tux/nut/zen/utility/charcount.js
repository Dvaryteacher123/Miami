'use strict';
module.exports = {
    name: 'charcount', category: 'utility', aliases: [],
    description: 'Count occurrences of a character in text: .charcount <char> <text>', usage: '.charcount a banana', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const char = args?.[0];
        const text = (args || []).slice(1).join(' ');
        if (!char || !text) return reply('❌ Usage: .charcount <char> <text>');
        const count = text.split('').filter((c) => c.toLowerCase() === char.toLowerCase()).length;
        return reply(`🔤 "${char}" appears ${count} time(s) in the text.`);
    }
};
