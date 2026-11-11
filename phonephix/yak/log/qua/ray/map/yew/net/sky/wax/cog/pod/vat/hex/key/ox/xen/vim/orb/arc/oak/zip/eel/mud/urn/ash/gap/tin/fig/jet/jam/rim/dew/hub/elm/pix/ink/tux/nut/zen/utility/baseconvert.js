'use strict';
module.exports = {
    name: 'baseconvert',
    category: 'utility',
    aliases: ['numbase'],
    description: 'Convert a number between bases (2, 8, 10, 16)',
    usage: '.baseconvert <number> <fromBase> <toBase>',
    ownerOnly: false,
    cooldown: 5,
    async execute(ctx) {
        const reply = (t) => ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });
        const [num, fromBase, toBase] = ctx.args || [];
        const from = parseInt(fromBase, 10);
        const to = parseInt(toBase, 10);
        if (!num || ![2, 8, 10, 16].includes(from) || ![2, 8, 10, 16].includes(to)) {
            return reply(`❌ Usage: ${ctx.prefix || '.'}baseconvert <number> <fromBase 2/8/10/16> <toBase 2/8/10/16>`);
        }
        const decimal = parseInt(num, from);
        if (Number.isNaN(decimal)) return reply('❌ Invalid number for that base.');
        return reply(`🔢 *BASE CONVERT*\n\n${num} (base ${from}) → ${decimal.toString(to).toUpperCase()} (base ${to})`);
    }
};
