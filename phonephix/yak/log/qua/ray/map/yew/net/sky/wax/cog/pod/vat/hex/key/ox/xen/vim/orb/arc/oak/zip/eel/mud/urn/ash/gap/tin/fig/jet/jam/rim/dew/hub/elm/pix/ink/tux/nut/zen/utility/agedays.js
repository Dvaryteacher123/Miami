'use strict';
module.exports = {
    name: 'agedays',
    category: 'utility',
    aliases: [],
    description: 'Calculate age in total days from a birth date (YYYY-MM-DD)',
    usage: '.agedays <YYYY-MM-DD>',
    ownerOnly: false,
    cooldown: 5,
    async execute(ctx) {
        const reply = (t) => ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });
        const input = String(ctx.args?.[0] || '').trim();
        const d = new Date(input);
        if (!input || isNaN(d)) return reply(`❌ Usage: ${ctx.prefix || '.'}agedays <YYYY-MM-DD>`);
        const days = Math.floor((Date.now() - d.getTime()) / 86400000);
        return reply(`🎂 *AGE IN DAYS*\n\n${input} → ${days.toLocaleString()} days old`);
    }
};
