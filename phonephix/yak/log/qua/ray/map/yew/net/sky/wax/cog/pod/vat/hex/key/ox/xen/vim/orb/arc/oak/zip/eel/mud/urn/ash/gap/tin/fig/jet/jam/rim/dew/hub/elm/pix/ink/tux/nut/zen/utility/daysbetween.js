'use strict';
module.exports = {
    name: 'daysbetween',
    category: 'utility',
    aliases: [],
    description: 'Calculate the number of days between two dates (YYYY-MM-DD)',
    usage: '.daysbetween <YYYY-MM-DD> <YYYY-MM-DD>',
    ownerOnly: false,
    cooldown: 5,
    async execute(ctx) {
        const reply = (t) => ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });
        const [a, b] = ctx.args || [];
        const d1 = new Date(a);
        const d2 = new Date(b);
        if (!a || !b || isNaN(d1) || isNaN(d2)) {
            return reply(`❌ Usage: ${ctx.prefix || '.'}daysbetween <YYYY-MM-DD> <YYYY-MM-DD>`);
        }
        const days = Math.round(Math.abs(d2 - d1) / 86400000);
        return reply(`📅 *DAYS BETWEEN*\n\n${a} → ${b}\n${days} day(s)`);
    }
};
