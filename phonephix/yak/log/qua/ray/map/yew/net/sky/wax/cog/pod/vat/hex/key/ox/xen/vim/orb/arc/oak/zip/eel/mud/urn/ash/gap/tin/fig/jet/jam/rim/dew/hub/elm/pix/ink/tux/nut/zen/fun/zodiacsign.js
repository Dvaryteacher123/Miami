'use strict';
module.exports = {
    name: 'zodiacsign',
    category: 'fun',
    aliases: ['starsign'],
    description: 'Find your zodiac sign from a birth date (MM-DD)',
    usage: '.zodiacsign <MM-DD>',
    ownerOnly: false,
    cooldown: 5,
    async execute(ctx) {
        const reply = (t) => ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });
        const input = String(ctx.args?.[0] || '').trim();
        const match = input.match(/^(\d{1,2})-(\d{1,2})$/);
        if (!match) return reply(`❌ Usage: ${ctx.prefix || '.'}zodiacsign <MM-DD>, e.g. 08-23`);
        const month = parseInt(match[1], 10);
        const day = parseInt(match[2], 10);
        const signs = [
            [1, 19, 'Capricorn'], [2, 18, 'Aquarius'], [3, 20, 'Pisces'],
            [4, 19, 'Aries'], [5, 20, 'Taurus'], [6, 20, 'Gemini'],
            [7, 22, 'Cancer'], [8, 22, 'Leo'], [9, 22, 'Virgo'],
            [10, 22, 'Libra'], [11, 21, 'Scorpio'], [12, 21, 'Sagittarius'],
            [12, 31, 'Capricorn']
        ];
        let sign = 'Capricorn';
        for (const [m, dLimit, name] of signs) {
            if (month === m && day <= dLimit) { sign = name; break; }
            if (month < m) { break; }
        }
        return reply(`✨ *ZODIAC SIGN*\n\n${input} → ${sign}`);
    }
};
