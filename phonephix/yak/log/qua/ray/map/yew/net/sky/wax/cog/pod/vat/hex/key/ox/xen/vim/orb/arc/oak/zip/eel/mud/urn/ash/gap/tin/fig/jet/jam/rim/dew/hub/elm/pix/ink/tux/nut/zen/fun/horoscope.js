'use strict';

const SIGNS = {
    aries: 'A bold move pays off today. Trust your instincts.',
    taurus: 'Patience brings a reward you\'ve been waiting for.',
    gemini: 'A conversation today changes your perspective.',
    cancer: 'Focus on home and family — good news is coming.',
    leo: 'Your confidence shines; others will notice.',
    virgo: 'Small details matter more than usual today.',
    libra: 'Balance is key — don\'t overcommit yourself.',
    scorpio: 'A hidden truth comes to light.',
    sagittarius: 'Adventure calls; say yes to something new.',
    capricorn: 'Hard work today sets up tomorrow\'s success.',
    aquarius: 'An unexpected idea leads to a breakthrough.',
    pisces: 'Trust your intuition on an important decision.'
};

module.exports = {
    name: 'horoscope',
    category: 'fun',
    aliases: ['zodiac'],
    description: 'Get your daily horoscope',
    usage: '.horoscope <sign>',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const sign = (args?.[0] || '').toLowerCase();
        if (!SIGNS[sign]) {
            return reply(`❌ Usage: .horoscope <sign>\n\nSigns: ${Object.keys(SIGNS).join(', ')}`);
        }

        return reply(`🔮 *HOROSCOPE — ${sign.toUpperCase()}*\n\n${SIGNS[sign]}`);
    }
};
