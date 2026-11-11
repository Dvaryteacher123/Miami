'use strict';
module.exports = {
    name: 'sortnums', category: 'utility', aliases: [],
    description: 'Sort a list of numbers ascending', usage: '.sortnums 5 2 8 1', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const nums = (args || []).map(Number).filter((n) => !isNaN(n));
        if (!nums.length) return reply('❌ Usage: .sortnums <numbers separated by spaces>');
        return reply(`📊 Sorted: ${nums.sort((a, b) => a - b).join(', ')}`);
    }
};
