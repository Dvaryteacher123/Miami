'use strict';
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
module.exports = {
    name: 'lcm', category: 'utility', aliases: [],
    description: 'Find least common multiple of two numbers', usage: '.lcm <a> <b>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const a = parseInt(args?.[0], 10), b = parseInt(args?.[1], 10);
        if (isNaN(a) || isNaN(b) || a === 0 || b === 0) return reply('❌ Usage: .lcm <a> <b>');
        const result = Math.abs(a * b) / gcd(Math.abs(a), Math.abs(b));
        return reply(`🔢 LCM(${a}, ${b}) = ${result}`);
    }
};
