'use strict';
module.exports = {
    name: 'minnum', category: 'utility', aliases: ['findmin'],
    description: 'Find the smallest number in a list', usage: '.minnum 3 9 1 7', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const nums = (args || []).map(Number).filter((n) => !isNaN(n));
        if (!nums.length) return reply('❌ Usage: .minnum <numbers separated by spaces>');
        return reply(`📊 Min = ${Math.min(...nums)}`);
    }
};
