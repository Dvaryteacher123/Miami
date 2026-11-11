'use strict';

/**
 * .numberformat - Format a number with commas
 */

module.exports = {
    name: 'numberformat',
    category: 'utility',
    aliases: [],
    description: "Format a number with commas",
    usage: ".numberformat 1234567.89",
    emoji: '🔢',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: String(t) }, { quoted: msg });
        const text = (args || []).join(' ').trim();
          const n = Number(String(args[0] || '').replace(/,/g, ''));
          if (!args[0] || !Number.isFinite(n)) return reply('❌ Usage: .numberformat 1234567.89');
          return reply('🔢 *NUMBER FORMAT*\n\n' + n.toLocaleString('en-US', { maximumFractionDigits: 6 }));
    }
};
