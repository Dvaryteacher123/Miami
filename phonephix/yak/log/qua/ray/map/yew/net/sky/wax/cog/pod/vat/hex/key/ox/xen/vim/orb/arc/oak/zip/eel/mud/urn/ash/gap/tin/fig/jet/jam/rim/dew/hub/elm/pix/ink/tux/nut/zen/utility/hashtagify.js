'use strict';

/**
 * .hashtagify - Turn words into hashtags
 */

module.exports = {
    name: 'hashtagify',
    category: 'utility',
    aliases: [],
    description: "Turn words into hashtags",
    usage: ".hashtagify best coffee in town",
    emoji: '#️⃣',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: String(t) }, { quoted: msg });
        const text = (args || []).join(' ').trim();
          if (!text) return reply('❌ Usage: .hashtagify <words>');
          const words = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').split(/\s+/).filter(Boolean);
          if (!words.length) return reply('❌ No words found.');
          const tags = ['#' + words.join(''), ...words.filter(w => w.length > 2).map(w => '#' + w)];
          return reply('#️⃣ *HASHTAGS*\n\n' + [...new Set(tags)].join(' '));
    }
};
