'use strict';
module.exports = {
    name: 'timeuntil',
    category: 'utility',
    aliases: [],
    description: 'Show how much time is left until a given date (YYYY-MM-DD)',
    usage: '.timeuntil <YYYY-MM-DD>',
    ownerOnly: false,
    cooldown: 5,
    async execute(ctx) {
        const reply = (t) => ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });
        const target = String(ctx.args?.[0] || '').trim();
        const d = new Date(target);
        if (!target || isNaN(d)) return reply(`❌ Usage: ${ctx.prefix || '.'}timeuntil <YYYY-MM-DD>`);
        const diffMs = d.getTime() - Date.now();
        if (diffMs <= 0) return reply(`📅 *TIME UNTIL*\n\n${target} has already passed.`);
        const days = Math.floor(diffMs / 86400000);
        const hours = Math.floor((diffMs % 86400000) / 3600000);
        return reply(`📅 *TIME UNTIL*\n\n${target} is ${days}d ${hours}h away.`);
    }
};
