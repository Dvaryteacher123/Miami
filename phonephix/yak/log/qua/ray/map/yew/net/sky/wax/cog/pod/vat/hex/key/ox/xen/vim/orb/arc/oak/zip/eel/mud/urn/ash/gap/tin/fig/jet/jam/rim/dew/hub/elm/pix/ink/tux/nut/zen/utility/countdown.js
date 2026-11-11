'use strict';

module.exports = {
    name: 'countdown',
    category: 'utility',
    aliases: ['daysuntil'],
    description: 'Count days until a date (YYYY-MM-DD)',
    usage: '.countdown 2027-01-01',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const target = new Date(args?.[0]);
        if (!args?.[0] || isNaN(target.getTime())) {
            return reply('❌ Usage: .countdown YYYY-MM-DD');
        }

        const now = new Date();
        const diffMs = target.getTime() - now.getTime();
        const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (days < 0) return reply(`📅 That date was ${Math.abs(days)} day(s) ago.`);
        if (days === 0) return reply('📅 That date is today!');
        return reply(`📅 *COUNTDOWN*\n\n${days} day(s) until ${args[0]}.`);
    }
};
