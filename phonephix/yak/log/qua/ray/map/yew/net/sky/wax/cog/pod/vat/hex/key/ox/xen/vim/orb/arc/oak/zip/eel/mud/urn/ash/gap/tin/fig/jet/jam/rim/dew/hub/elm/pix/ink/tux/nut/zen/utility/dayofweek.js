'use strict';
module.exports = {
    name: 'dayofweek', category: 'utility', aliases: ['whatday'],
    description: 'Find the day of the week for a date (YYYY-MM-DD)', usage: '.dayofweek 2026-12-25', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const date = new Date(args?.[0]);
        if (!args?.[0] || isNaN(date.getTime())) return reply('❌ Usage: .dayofweek YYYY-MM-DD');
        const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        return reply(`📅 ${args[0]} is a ${days[date.getUTCDay()]}.`);
    }
};
