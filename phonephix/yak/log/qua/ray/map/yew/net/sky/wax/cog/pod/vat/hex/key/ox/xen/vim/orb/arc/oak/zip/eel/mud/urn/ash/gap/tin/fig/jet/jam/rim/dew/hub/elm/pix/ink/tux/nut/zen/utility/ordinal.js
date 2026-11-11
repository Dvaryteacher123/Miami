'use strict';

/**
 * .ordinal - Number to ordinal (1st, 2nd, 3rd)
 */

module.exports = {
    name: 'ordinal',
    category: 'utility',
    aliases: [],
    description: "Number to ordinal (1st, 2nd, 3rd)",
    usage: ".ordinal 23",
    emoji: '🥇',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: String(t) }, { quoted: msg });
        const text = (args || []).join(' ').trim();
          const n = parseInt(args[0], 10);
          if (!Number.isFinite(n)) return reply('❌ Usage: .ordinal 23');
          const a = Math.abs(n), t = a % 100;
          const s = (t >= 11 && t <= 13) ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[a % 10] || 'th');
          return reply('🥇 *ORDINAL*\n\n' + n + s);
    }
};
