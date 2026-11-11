'use strict';

/**
 * .uppercase - Make text UPPERCASE
 */

module.exports = {
    name: 'uppercase',
    category: 'utility',
    aliases: [],
    description: "Make text UPPERCASE",
    usage: ".uppercase <text>",
    emoji: '🔠',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: String(t) }, { quoted: msg });
        const text = (args || []).join(' ').trim();
          if (!text) return reply('❌ Usage: .uppercase <text>');
          return reply('🔠 *UPPERCASE*\n\n' + text.toUpperCase());
    }
};
