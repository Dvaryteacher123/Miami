'use strict';
module.exports = {
    name: 'randomdate',
    category: 'fun',
    aliases: [],
    description: 'Generate a random date between two years',
    usage: '.randomdate <startYear> <endYear>',
    ownerOnly: false,
    cooldown: 5,
    async execute(ctx) {
        const reply = (t) => ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });
        const start = parseInt(ctx.args?.[0], 10) || 2000;
        const end = parseInt(ctx.args?.[1], 10) || new Date().getFullYear();
        const lo = Math.min(start, end);
        const hi = Math.max(start, end);
        const year = lo + Math.floor(Math.random() * (hi - lo + 1));
        const month = 1 + Math.floor(Math.random() * 12);
        const day = 1 + Math.floor(Math.random() * 28);
        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return reply(`🎲 *RANDOM DATE*\n\n${date}`);
    }
};
