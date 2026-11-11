'use strict';
module.exports = {
    name: 'factorial', category: 'utility', aliases: [],
    description: 'Calculate factorial of a number', usage: '.factorial <n>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const n = parseInt(args?.[0], 10);
        if (!Number.isInteger(n) || n < 0 || n > 170) return reply('❌ Usage: .factorial <n> (0-170)');
        let result = 1n;
        for (let i = 2n; i <= BigInt(n); i++) result *= i;
        return reply(`🔢 *FACTORIAL*\n\n${n}! = ${result.toString()}`);
    }
};
