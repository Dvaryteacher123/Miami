'use strict';
module.exports = {
    name: 'simpleinterest', category: 'utility', aliases: ['si'],
    description: 'Calculate simple interest: .simpleinterest <principal> <rate%> <years>', usage: '.simpleinterest 1000 5 3', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const p = parseFloat(args?.[0]), r = parseFloat(args?.[1]), y = parseFloat(args?.[2]);
        if (isNaN(p) || isNaN(r) || isNaN(y)) return reply('❌ Usage: .simpleinterest <principal> <rate%> <years>');
        const interest = (p * r * y) / 100;
        return reply(`💰 *SIMPLE INTEREST*\n\nInterest: ${interest.toFixed(2)}\nTotal: ${(p + interest).toFixed(2)}`);
    }
};
