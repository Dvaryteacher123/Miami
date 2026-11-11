'use strict';

/**
 * .fortune - Open a fortune cookie
 */

module.exports = {
    name: 'fortune',
    category: 'fun',
    aliases: [],
    description: "Open a fortune cookie",
    usage: ".fortune",
    emoji: '🥠',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: String(t) }, { quoted: msg });
        const text = (args || []).join(' ').trim();
          const F = [
            'A pleasant surprise is waiting for you.', 'Your hard work will pay off soon.',
            'Someone is thinking of you right now.', 'A new opportunity will knock. Open the door.',
            'Patience today brings success tomorrow.', 'Money comes to those who plan.',
            'You will meet someone who changes your week.', 'Today is a good day to start.',
            'Your kindness will return to you.', 'Do not rush. The best things take time.',
            'A small step today is a big win later.', 'Good news arrives before the weekend.'
          ];
          return reply('🥠 *FORTUNE COOKIE*\n\n' + F[Math.floor(Math.random() * F.length)]);
    }
};
