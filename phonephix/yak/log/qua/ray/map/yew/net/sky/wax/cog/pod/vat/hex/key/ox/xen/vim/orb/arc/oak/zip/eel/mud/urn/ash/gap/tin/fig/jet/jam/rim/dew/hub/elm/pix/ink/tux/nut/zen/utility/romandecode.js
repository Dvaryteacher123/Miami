'use strict';
const VALUES = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
module.exports = {
    name: 'romandecode', category: 'utility', aliases: ['fromroman'],
    description: 'Convert Roman numerals to a number', usage: '.romandecode <numeral>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const raw = (args?.[0] || '').toUpperCase();
        if (!raw || !/^[IVXLCDM]+$/.test(raw)) return reply('❌ Usage: .romandecode <numeral>');
        let total = 0;
        for (let i = 0; i < raw.length; i++) {
            const cur = VALUES[raw[i]], next = VALUES[raw[i + 1]];
            if (next > cur) total -= cur; else total += cur;
        }
        return reply(`🏛️ *DECODED*\n\n${raw} = ${total}`);
    }
};
