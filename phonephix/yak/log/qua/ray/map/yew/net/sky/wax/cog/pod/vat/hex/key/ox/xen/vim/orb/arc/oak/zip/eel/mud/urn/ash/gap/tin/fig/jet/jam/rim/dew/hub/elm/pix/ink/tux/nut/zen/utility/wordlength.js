'use strict';
module.exports = {
    name: 'longestword', category: 'utility', aliases: [],
    description: 'Find the longest word in a sentence', usage: '.longestword <text>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const text = (args || []).join(' ');
        if (!text) return reply('❌ Usage: .longestword <text>');
        const words = text.split(/\s+/);
        const longest = words.reduce((a, b) => (b.length > a.length ? b : a), '');
        return reply(`📏 Longest word: "${longest}" (${longest.length} letters)`);
    }
};
