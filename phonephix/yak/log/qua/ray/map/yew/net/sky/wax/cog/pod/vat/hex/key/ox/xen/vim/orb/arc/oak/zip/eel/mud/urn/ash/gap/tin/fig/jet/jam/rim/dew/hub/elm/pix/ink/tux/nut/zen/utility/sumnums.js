'use strict';
module.exports = {
    name: 'sum', category: 'utility', aliases: ['addnums'],
    description: 'Sum a list of numbers', usage: '.sum 1 2 3 4', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const nums = (args || []).map(Number).filter((n) => !isNaN(n));
        if (!nums.length) return reply('❌ Usage: .sum <numbers separated by spaces>');
        return reply(`📊 Sum of [${nums.join(', ')}] = ${nums.reduce((a, b) => a + b, 0)}`);
    }
};
