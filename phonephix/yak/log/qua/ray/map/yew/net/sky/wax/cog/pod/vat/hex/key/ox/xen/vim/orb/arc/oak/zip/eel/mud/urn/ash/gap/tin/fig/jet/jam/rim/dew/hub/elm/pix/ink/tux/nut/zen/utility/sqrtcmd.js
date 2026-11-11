'use strict';
module.exports = {
    name: 'sqrt', category: 'utility', aliases: ['squareroot'],
    description: 'Calculate the square root of a number', usage: '.sqrt <number>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const n = parseFloat(args?.[0]);
        if (isNaN(n) || n < 0) return reply('❌ Usage: .sqrt <non-negative number>');
        return reply(`√${n} = ${Math.sqrt(n)}`);
    }
};
