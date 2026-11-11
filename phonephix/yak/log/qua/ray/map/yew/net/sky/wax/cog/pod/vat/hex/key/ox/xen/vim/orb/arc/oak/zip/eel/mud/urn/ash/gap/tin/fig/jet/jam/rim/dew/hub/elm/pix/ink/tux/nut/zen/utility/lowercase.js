'use strict';

/**
 * .lowercase - Make text lowercase
 */

module.exports = {
    name: 'lowercase',
    category: 'utility',
    aliases: [],
    description: "Make text lowercase",
    usage: ".lowercase <text>",
    emoji: '🔡',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: String(t) }, { quoted: msg });
        const text = (args || []).join(' ').trim();
          if (!text) return reply('❌ Usage: .lowercase <text>');
          return reply('🔡 *LOWERCASE*\n\n' + text.toLowerCase());
    }
};
