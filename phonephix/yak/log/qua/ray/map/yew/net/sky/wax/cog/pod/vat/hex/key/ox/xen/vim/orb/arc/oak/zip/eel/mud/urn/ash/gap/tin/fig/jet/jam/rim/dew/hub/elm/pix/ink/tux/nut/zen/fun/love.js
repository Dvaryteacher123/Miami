'use strict';

module.exports = {
    name: 'lovecalc',
    category: 'fun',
    aliases: ['lovemeter'],
    description: 'Calculate a fun love percentage between two names',
    usage: '.lovecalc <name1> <name2>',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const [a, b] = args || [];
        if (!a || !b) return reply('❌ Usage: .lovecalc <name1> <name2>');

        let seed = 0;
        for (const c of (a + b).toLowerCase()) seed += c.charCodeAt(0);
        const pct = seed % 101;

        return reply(`💘 *LOVE CALCULATOR*\n\n${a} + ${b} = ${pct}%`);
    }
};
