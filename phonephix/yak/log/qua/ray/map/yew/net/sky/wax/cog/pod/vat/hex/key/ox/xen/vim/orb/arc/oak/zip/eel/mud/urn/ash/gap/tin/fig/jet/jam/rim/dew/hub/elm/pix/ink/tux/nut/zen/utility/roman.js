'use strict';
const MAP = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
module.exports = {
    name: 'roman', category: 'utility', aliases: ['toroman'],
    description: 'Convert a number to Roman numerals', usage: '.roman <number 1-3999>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        let n = parseInt(args?.[0], 10);
        if (!n || n < 1 || n > 3999) return reply('❌ Usage: .roman <number 1-3999>');
        let out = '';
        for (const [val, sym] of MAP) { while (n >= val) { out += sym; n -= val; } }
        return reply(`🏛️ *ROMAN NUMERAL*\n\n${out}`);
    }
};
