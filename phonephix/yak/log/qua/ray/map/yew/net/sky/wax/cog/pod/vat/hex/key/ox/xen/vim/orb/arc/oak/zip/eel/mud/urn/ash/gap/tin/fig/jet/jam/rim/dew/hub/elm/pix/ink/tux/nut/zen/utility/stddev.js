'use strict';

/**
 * .stddev - Mean and standard deviation of numbers
 */

module.exports = {
    name: 'stddev',
    category: 'utility',
    aliases: [],
    description: "Mean and standard deviation of numbers",
    usage: ".stddev 4 8 15 16 23 42",
    emoji: '📊',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: String(t) }, { quoted: msg });
        const text = (args || []).join(' ').trim();
          const nums = args.join(' ').split(/[\s,]+/).filter(Boolean).map(Number);
          if (nums.length < 2 || nums.some(x => !Number.isFinite(x))) return reply('❌ Usage: .stddev 4 8 15 16 23 42  (at least 2 numbers)');
          const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
          const ss = nums.reduce((a, b) => a + (b - mean) ** 2, 0);
          const f = x => Number(x.toPrecision(8));
          return reply('📊 *STANDARD DEVIATION*\n\nCount: ' + nums.length + '\nMean: ' + f(mean) + '\nPopulation σ: ' + f(Math.sqrt(ss / nums.length)) + '\nSample s: ' + f(Math.sqrt(ss / (nums.length - 1))));
    }
};
