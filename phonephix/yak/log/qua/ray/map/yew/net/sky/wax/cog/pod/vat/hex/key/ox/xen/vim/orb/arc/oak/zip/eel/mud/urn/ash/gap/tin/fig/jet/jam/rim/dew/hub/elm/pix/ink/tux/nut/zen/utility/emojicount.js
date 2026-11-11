'use strict';

/**
 * .emojicount - Count the emojis in a text
 */

module.exports = {
    name: 'emojicount',
    category: 'utility',
    aliases: [],
    description: "Count the emojis in a text",
    usage: ".emojicount <text>",
    emoji: '😀',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: String(t) }, { quoted: msg });
        const text = (args || []).join(' ').trim();
          if (!text) return reply('❌ Usage: .emojicount <text>');
          const found = text.match(/\p{Extended_Pictographic}/gu) || [];
          const uniq = [...new Set(found)];
          return reply('😀 *EMOJI COUNT*\n\nTotal: ' + found.length + '\nUnique: ' + uniq.length + (uniq.length ? '\n' + uniq.join(' ') : ''));
    }
};
