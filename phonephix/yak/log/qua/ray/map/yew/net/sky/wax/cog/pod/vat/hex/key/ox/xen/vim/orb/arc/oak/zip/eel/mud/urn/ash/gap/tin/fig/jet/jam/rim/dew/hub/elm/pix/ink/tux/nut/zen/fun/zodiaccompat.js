'use strict';
module.exports = {
    name: 'zodiaccompat', category: 'fun', aliases: ['zodiacmatch'],
    description: 'Fun zodiac compatibility between two signs', usage: '.zodiaccompat leo aries', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const [a, b] = args || [];
        if (!a || !b) return reply('❌ Usage: .zodiaccompat <sign1> <sign2>');
        let seed = 0;
        for (const c of (a + b).toLowerCase()) seed += c.charCodeAt(0);
        const pct = 40 + (seed % 61);
        return reply(`♈ *ZODIAC COMPATIBILITY*\n\n${a} + ${b} = ${pct}% match`);
    }
};
