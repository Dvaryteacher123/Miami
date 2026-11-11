'use strict';
module.exports = {
    name: 'isleapyear', category: 'utility', aliases: ['leapyear'],
    description: 'Check if a year is a leap year', usage: '.isleapyear 2024', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const y = parseInt(args?.[0], 10);
        if (!y) return reply('❌ Usage: .isleapyear <year>');
        const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
        return reply(isLeap ? `✅ ${y} is a leap year.` : `❌ ${y} is not a leap year.`);
    }
};
