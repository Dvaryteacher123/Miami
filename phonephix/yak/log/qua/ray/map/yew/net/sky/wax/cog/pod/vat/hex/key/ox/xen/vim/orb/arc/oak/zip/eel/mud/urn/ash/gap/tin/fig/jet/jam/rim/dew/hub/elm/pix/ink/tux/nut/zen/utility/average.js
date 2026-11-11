'use strict';
module.exports = {
    name: 'average', category: 'utility', aliases: ['avg'],
    description: 'Calculate average of a list of numbers', usage: '.average 1 2 3 4', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const nums = (args || []).map(Number).filter((n) => !isNaN(n));
        if (!nums.length) return reply('❌ Usage: .average <numbers separated by spaces>');
        const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
        return reply(`📊 Average of [${nums.join(', ')}] = ${avg.toFixed(2)}`);
    }
};
