'use strict';

/**
 * .hoursbetween - Hours between two dates
 */

module.exports = {
    name: 'hoursbetween',
    category: 'utility',
    aliases: [],
    description: "Hours between two dates",
    usage: ".hoursbetween 2026-01-01 2026-12-31",
    emoji: '⏳',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: String(t) }, { quoted: msg });
        const text = (args || []).join(' ').trim();
          if (args.length < 2) return reply('❌ Usage: .hoursbetween 2026-01-01 2026-12-31');
          const a = new Date(args[0]), b = new Date(args[1]);
          if (isNaN(a) || isNaN(b)) return reply('❌ Invalid date. Use YYYY-MM-DD.');
          const ms = Math.abs(b - a);
          return reply('⏳ *TIME BETWEEN*\n\n📅 Days: ' + (ms / 86400000).toFixed(2) + '\n🕐 Hours: ' + Math.round(ms / 3600000).toLocaleString('en-US') + '\n⏱️ Minutes: ' + Math.round(ms / 60000).toLocaleString('en-US'));
    }
};
