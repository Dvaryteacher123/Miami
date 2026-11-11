'use strict';
module.exports = {
    name: 'compoundinterest', category: 'utility', aliases: ['ci'],
    description: 'Calculate compound interest: .compoundinterest <principal> <rate%> <years>', usage: '.compoundinterest 1000 5 3', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const p = parseFloat(args?.[0]), r = parseFloat(args?.[1]), y = parseFloat(args?.[2]);
        if (isNaN(p) || isNaN(r) || isNaN(y)) return reply('❌ Usage: .compoundinterest <principal> <rate%> <years>');
        const total = p * Math.pow(1 + r / 100, y);
        return reply(`💰 *COMPOUND INTEREST*\n\nTotal: ${total.toFixed(2)}\nInterest earned: ${(total - p).toFixed(2)}`);
    }
};
