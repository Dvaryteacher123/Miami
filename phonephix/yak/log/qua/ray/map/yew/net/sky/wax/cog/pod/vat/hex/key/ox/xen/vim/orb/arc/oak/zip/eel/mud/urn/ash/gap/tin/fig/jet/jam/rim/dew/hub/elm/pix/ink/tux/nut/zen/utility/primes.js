'use strict';

/**
 * .primes - List prime numbers up to N
 */

module.exports = {
    name: 'primes',
    category: 'utility',
    aliases: [],
    description: "List prime numbers up to N",
    usage: ".primes 50",
    emoji: '🔢',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: String(t) }, { quoted: msg });
        const text = (args || []).join(' ').trim();
          const n = parseInt(args[0], 10);
          if (!Number.isFinite(n) || n < 2 || n > 100000) return reply('❌ Usage: .primes 50  (2 to 100000)');
          const sieve = new Uint8Array(n + 1);
          const out = [];
          for (let i = 2; i <= n; i++) {
            if (!sieve[i]) { out.push(i); for (let j = i * i; j <= n; j += i) sieve[j] = 1; }
          }
          const shown = out.slice(0, 150).join(', ');
          return reply('🔢 *PRIMES UP TO ' + n + '*\n\nCount: ' + out.length + '\n\n' + shown + (out.length > 150 ? ' ...' : ''));
    }
};
