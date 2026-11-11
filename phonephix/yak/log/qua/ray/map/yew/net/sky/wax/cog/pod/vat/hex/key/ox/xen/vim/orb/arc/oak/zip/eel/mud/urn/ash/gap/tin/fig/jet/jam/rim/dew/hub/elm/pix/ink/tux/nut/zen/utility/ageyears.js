'use strict';

module.exports = {
    name: 'ageyears',
    category: 'utility',
    aliases: ['calcage'],
    description: 'Calculate age from a birth date (YYYY-MM-DD)',
    usage: '.ageyears 2000-05-14',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const birth = new Date(args?.[0]);
        if (!args?.[0] || isNaN(birth.getTime())) return reply('❌ Usage: .ageyears YYYY-MM-DD');

        const now = new Date();
        let age = now.getFullYear() - birth.getFullYear();
        const m = now.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;

        return reply(`🎂 *AGE CALCULATOR*\n\nYou are ${age} years old.`);
    }
};
