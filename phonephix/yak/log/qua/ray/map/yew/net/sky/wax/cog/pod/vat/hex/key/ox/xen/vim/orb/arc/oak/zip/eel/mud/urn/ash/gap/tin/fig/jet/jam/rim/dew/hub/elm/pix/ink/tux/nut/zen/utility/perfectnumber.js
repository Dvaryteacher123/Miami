'use strict';
module.exports = {
    name: 'perfectnumber', category: 'utility', aliases: [],
    description: 'Check if a number is a perfect number', usage: '.perfectnumber <number>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const n = parseInt(args?.[0], 10);
        if (!n || n < 1) return reply('❌ Usage: .perfectnumber <positive number>');
        let sum = 0;
        for (let i = 1; i < n; i++) if (n % i === 0) sum += i;
        return reply(sum === n ? `✅ ${n} is a perfect number.` : `❌ ${n} is not a perfect number.`);
    }
};
