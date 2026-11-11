'use strict';
module.exports = {
    name: 'armstrong', category: 'utility', aliases: [],
    description: 'Check if a number is an Armstrong number', usage: '.armstrong <number>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const n = args?.[0];
        if (!n || !/^\d+$/.test(n)) return reply('❌ Usage: .armstrong <number>');
        const digits = n.split('');
        const power = digits.length;
        const sum = digits.reduce((acc, d) => acc + Math.pow(parseInt(d, 10), power), 0);
        return reply(sum === parseInt(n, 10) ? `✅ ${n} is an Armstrong number.` : `❌ ${n} is not an Armstrong number.`);
    }
};
