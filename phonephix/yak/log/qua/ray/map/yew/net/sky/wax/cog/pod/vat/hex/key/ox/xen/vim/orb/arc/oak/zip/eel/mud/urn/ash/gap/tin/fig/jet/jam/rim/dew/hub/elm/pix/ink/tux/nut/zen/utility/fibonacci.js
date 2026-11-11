'use strict';
module.exports = {
    name: 'fibonacci', category: 'utility', aliases: ['fib'],
    description: 'Print the fibonacci sequence up to N terms', usage: '.fibonacci <count>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        let n = parseInt(args?.[0], 10);
        if (!n || n < 1) n = 10;
        if (n > 50) n = 50;
        const seq = [0, 1];
        for (let i = 2; i < n; i++) seq.push(seq[i - 1] + seq[i - 2]);
        return reply(`🔢 *FIBONACCI (${n})*\n\n${seq.slice(0, n).join(', ')}`);
    }
};
