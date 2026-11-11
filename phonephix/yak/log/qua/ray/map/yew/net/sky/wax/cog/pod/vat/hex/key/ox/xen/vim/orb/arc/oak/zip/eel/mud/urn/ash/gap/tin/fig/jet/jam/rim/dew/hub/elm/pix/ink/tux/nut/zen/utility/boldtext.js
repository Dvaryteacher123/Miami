'use strict';

/**
 * .boldtext - Turn text into bold unicode letters
 */

module.exports = {
    name: 'boldtext',
    category: 'utility',
    aliases: [],
    description: "Turn text into bold unicode letters",
    usage: ".boldtext hello",
    emoji: '🅱️',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: String(t) }, { quoted: msg });
        const text = (args || []).join(' ').trim();
          if (!text) return reply('❌ Usage: .boldtext <text>');
          const out = [...text].map(ch => {
            const c = ch.codePointAt(0);
            if (c >= 65 && c <= 90) return String.fromCodePoint(0x1D400 + c - 65);
            if (c >= 97 && c <= 122) return String.fromCodePoint(0x1D41A + c - 97);
            if (c >= 48 && c <= 57) return String.fromCodePoint(0x1D7CE + c - 48);
            return ch;
          }).join('');
          return reply('🅱️ *BOLD TEXT*\n\n' + out);
    }
};
