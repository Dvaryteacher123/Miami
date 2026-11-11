'use strict';
module.exports = {
    name: 'reverseint', category: 'utility', aliases: [],
    description: 'Reverse the digits of a number', usage: '.reverseint <number>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const n = args?.[0];
        if (!n || isNaN(n)) return reply('❌ Usage: .reverseint <number>');
        const neg = n.startsWith('-');
        const digits = n.replace('-', '').split('').reverse().join('');
        return reply(`🔢 ${neg ? '-' : ''}${digits}`);
    }
};
