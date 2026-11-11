'use strict';

/**
 * .rectarea - Area, perimeter and diagonal of a rectangle
 */

module.exports = {
    name: 'rectarea',
    category: 'utility',
    aliases: [],
    description: "Area, perimeter and diagonal of a rectangle",
    usage: ".rectarea 5 3",
    emoji: '📐',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: String(t) }, { quoted: msg });
        const text = (args || []).join(' ').trim();
          const w = Number(args[0]), h = Number(args[1]);
          if (!(w > 0) || !(h > 0)) return reply('❌ Usage: .rectarea <width> <height>');
          const f = x => Number(x.toPrecision(10));
          return reply('📐 *RECTANGLE*\n\nArea: ' + f(w * h) + '\nPerimeter: ' + f(2 * (w + h)) + '\nDiagonal: ' + f(Math.hypot(w, h)));
    }
};
