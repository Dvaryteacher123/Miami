'use strict';

/**
 * .hms - Seconds to hours:minutes:seconds
 */

module.exports = {
    name: 'hms',
    category: 'utility',
    aliases: [],
    description: "Seconds to hours:minutes:seconds",
    usage: ".hms 3725",
    emoji: '⏱️',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: String(t) }, { quoted: msg });
        const text = (args || []).join(' ').trim();
          const s = parseInt(args[0], 10);
          if (!Number.isFinite(s) || s < 0) return reply('❌ Usage: .hms 3725');
          const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
          const p = n => String(n).padStart(2, '0');
          return reply('⏱️ *TIME*\n\n' + h + 'h ' + m + 'm ' + x + 's\n' + p(h) + ':' + p(m) + ':' + p(x));
    }
};
