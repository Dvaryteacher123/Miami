'use strict';
module.exports = {
    name: 'prime', category: 'utility', aliases: ['isprime'],
    description: 'Check if a number is prime', usage: '.prime <number>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const n = parseInt(args?.[0], 10);
        if (!Number.isInteger(n) || n < 0) return reply('❌ Usage: .prime <number>');
        if (n < 2) return reply(`${n} is not a prime number.`);
        let isPrime = true;
        for (let i = 2; i * i <= n; i++) { if (n % i === 0) { isPrime = false; break; } }
        return reply(`🔢 ${n} is ${isPrime ? '' : 'not '}a prime number.`);
    }
};
