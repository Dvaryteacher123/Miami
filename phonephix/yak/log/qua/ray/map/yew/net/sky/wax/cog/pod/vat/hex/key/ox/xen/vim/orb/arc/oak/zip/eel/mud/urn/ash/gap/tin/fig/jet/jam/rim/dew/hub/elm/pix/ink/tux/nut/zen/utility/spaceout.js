'use strict';

/**
 * .spaceout - Put spaces between letters
 */

module.exports = {
    name: 'spaceout',
    category: 'utility',
    aliases: [],
    description: "Put spaces between letters",
    usage: ".spaceout hello",
    emoji: '↔️',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: String(t) }, { quoted: msg });
        const text = (args || []).join(' ').trim();
          if (!text) return reply('❌ Usage: .spaceout <text>');
          return reply('↔️ *SPACED*\n\n' + [...text].join(' '));
    }
};
