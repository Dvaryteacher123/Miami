'use strict';
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
module.exports = {
    name: 'gcd', category: 'utility', aliases: [],
    description: 'Find greatest common divisor of two numbers', usage: '.gcd <a> <b>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const a = parseInt(args?.[0], 10), b = parseInt(args?.[1], 10);
        if (isNaN(a) || isNaN(b)) return reply('❌ Usage: .gcd <a> <b>');
        return reply(`🔢 GCD(${a}, ${b}) = ${gcd(Math.abs(a), Math.abs(b))}`);
    }
};
