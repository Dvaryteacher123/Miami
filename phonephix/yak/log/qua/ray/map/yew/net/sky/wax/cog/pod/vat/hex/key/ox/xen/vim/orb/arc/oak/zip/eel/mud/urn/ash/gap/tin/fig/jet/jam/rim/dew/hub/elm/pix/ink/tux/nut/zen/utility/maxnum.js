'use strict';
module.exports = {
    name: 'maxnum', category: 'utility', aliases: ['findmax'],
    description: 'Find the largest number in a list', usage: '.maxnum 3 9 1 7', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const nums = (args || []).map(Number).filter((n) => !isNaN(n));
        if (!nums.length) return reply('❌ Usage: .maxnum <numbers separated by spaces>');
        return reply(`📊 Max = ${Math.max(...nums)}`);
    }
};
