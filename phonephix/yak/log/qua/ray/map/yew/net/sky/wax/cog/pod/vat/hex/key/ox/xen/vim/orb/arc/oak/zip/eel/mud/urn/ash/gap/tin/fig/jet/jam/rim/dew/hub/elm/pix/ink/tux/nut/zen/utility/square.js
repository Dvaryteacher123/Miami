'use strict';

/**
 * .square - Square and cube of a number
 */

module.exports = {
    name: 'square',
    category: 'utility',
    aliases: [],
    description: "Square and cube of a number",
    usage: ".square 12",
    emoji: '⬛',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: String(t) }, { quoted: msg });
        const text = (args || []).join(' ').trim();
          const n = Number(args[0]);
          if (!args[0] || !Number.isFinite(n)) return reply('❌ Usage: .square 12');
          const f = x => Number(x.toPrecision(12));
          return reply('⬛ *SQUARE & CUBE*\n\n' + n + '² = ' + f(n * n) + '\n' + n + '³ = ' + f(n * n * n));
    }
};
