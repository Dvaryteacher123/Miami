'use strict';
module.exports = {
    name: 'wordfrequency', category: 'utility', aliases: ['mostused'],
    description: 'Find the most frequent word in text', usage: '.wordfrequency <text>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const text = (args || []).join(' ');
        if (!text) return reply('❌ Usage: .wordfrequency <text>');
        const words = text.toLowerCase().match(/[a-z0-9']+/g) || [];
        if (!words.length) return reply('❌ No words found.');
        const counts = {};
        for (const w of words) counts[w] = (counts[w] || 0) + 1;
        const [top, topCount] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        return reply(`📊 Most frequent word: "${top}" (${topCount}x)`);
    }
};
