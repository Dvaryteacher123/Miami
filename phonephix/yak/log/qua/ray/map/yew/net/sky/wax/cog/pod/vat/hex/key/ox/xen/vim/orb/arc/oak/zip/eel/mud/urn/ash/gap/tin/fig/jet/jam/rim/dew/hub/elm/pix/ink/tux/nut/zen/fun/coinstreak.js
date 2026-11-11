'use strict';

/**
 * .coinstreak - Flip many coins at once (1-30)
 */

module.exports = {
    name: 'coinstreak',
    category: 'fun',
    aliases: [],
    description: "Flip many coins at once (1-30)",
    usage: ".coinstreak [count]",
    emoji: '🪙',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: String(t) }, { quoted: msg });
        const text = (args || []).join(' ').trim();
          let n = parseInt(args[0], 10);
          if (!Number.isFinite(n)) n = 10;
          n = Math.max(1, Math.min(30, n));
          const flips = Array.from({ length: n }, () => (Math.random() < 0.5 ? 'H' : 'T'));
          const h = flips.filter(x => x === 'H').length;
          return reply('🪙 *COIN STREAK* (' + n + ')\n\n' + flips.join(' ') + '\n\n🟡 Heads: ' + h + '\n⚪ Tails: ' + (n - h));
    }
};
