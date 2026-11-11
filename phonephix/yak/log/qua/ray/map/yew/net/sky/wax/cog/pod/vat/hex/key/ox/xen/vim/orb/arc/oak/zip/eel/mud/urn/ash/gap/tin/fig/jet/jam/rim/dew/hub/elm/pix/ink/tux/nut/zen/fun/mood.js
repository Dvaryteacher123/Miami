'use strict';

/**
 * .mood - Get a random mood
 */

module.exports = {
    name: 'mood',
    category: 'fun',
    aliases: [],
    description: "Get a random mood",
    usage: ".mood",
    emoji: '😶',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: String(t) }, { quoted: msg });
        const text = (args || []).join(' ').trim();
          const M = ['😄 Happy', '😎 Chill', '🥱 Sleepy', '🔥 Pumped', '🤔 Thoughtful', '😌 Peaceful', '🥳 Party mode', '😤 Focused', '🤪 Crazy', '😴 Needs a nap', '💪 Unstoppable', '🥰 Loved'];
          return reply('😶 *MOOD OF THE MOMENT*\n\n' + M[Math.floor(Math.random() * M.length)]);
    }
};
