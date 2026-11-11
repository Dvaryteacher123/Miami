'use strict';

/**
 * .zeropad - Pad a number with leading zeros
 */

module.exports = {
    name: 'zeropad',
    category: 'utility',
    aliases: [],
    description: "Pad a number with leading zeros",
    usage: ".zeropad 7 4",
    emoji: '0️⃣',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: String(t) }, { quoted: msg });
        const text = (args || []).join(' ').trim();
          const v = String(args[0] || '');
          const w = parseInt(args[1], 10);
          if (!/^-?\d+$/.test(v) || !Number.isFinite(w) || w < 1 || w > 50) return reply('❌ Usage: .zeropad 7 4  (number, width up to 50)');
          const neg = v.startsWith('-');
          const d = neg ? v.slice(1) : v;
          return reply('0️⃣ *ZERO PAD*\n\n' + (neg ? '-' : '') + d.padStart(w, '0'));
    }
};
