'use strict';
module.exports = {
    name: 'duplicatewords', category: 'utility', aliases: [],
    description: 'Find duplicate words in text', usage: '.duplicatewords <text>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const text = (args || []).join(' ');
        if (!text) return reply('❌ Usage: .duplicatewords <text>');
        const words = text.toLowerCase().match(/[a-z0-9']+/g) || [];
        const counts = {};
        for (const w of words) counts[w] = (counts[w] || 0) + 1;
        const dups = Object.entries(counts).filter(([, c]) => c > 1).map(([w, c]) => `${w} (${c}x)`);
        return reply(dups.length ? `🔁 Duplicates: ${dups.join(', ')}` : '✅ No duplicate words found.');
    }
};
