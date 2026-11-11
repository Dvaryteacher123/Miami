'use strict';

/**
 * .slot - Play the slot machine
 */

module.exports = {
    name: 'slot',
    category: 'fun',
    aliases: [],
    description: "Play the slot machine",
    usage: ".slot",
    emoji: '🎰',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: String(t) }, { quoted: msg });
        const text = (args || []).join(' ').trim();
          const S = ['🍒', '🍋', '🍇', '🍉', '⭐', '💎', '7️⃣'];
          const r = () => S[Math.floor(Math.random() * S.length)];
          const a = r(), b = r(), c = r();
          const win = a === b && b === c;
          const two = !win && (a === b || b === c || a === c);
          return reply('🎰 *SLOT MACHINE*\n\n┃ ' + a + ' ┃ ' + b + ' ┃ ' + c + ' ┃\n\n' +
            (win ? '🎉 *JACKPOT!* You win!' : two ? '😮 So close! Two match.' : '😅 No luck. Try again!'));
    }
};
