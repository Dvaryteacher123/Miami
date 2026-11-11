'use strict';

/**
 * .collatz - Collatz sequence of a number
 */

module.exports = {
    name: 'collatz',
    category: 'utility',
    aliases: [],
    description: "Collatz sequence of a number",
    usage: ".collatz 27",
    emoji: '🌀',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: String(t) }, { quoted: msg });
        const text = (args || []).join(' ').trim();
          let n = parseInt(args[0], 10);
          if (!Number.isFinite(n) || n < 1 || n > 1e12) return reply('❌ Usage: .collatz 27');
          const seq = [n];
          let steps = 0;
          while (n !== 1 && steps < 5000) { n = n % 2 ? 3 * n + 1 : n / 2; seq.push(n); steps++; }
          const peak = Math.max(...seq);
          const show = seq.length > 40 ? seq.slice(0, 40).join(' → ') + ' → ...' : seq.join(' → ');
          return reply('🌀 *COLLATZ*\n\nSteps: ' + steps + '\nHighest: ' + peak + '\n\n' + show);
    }
};
