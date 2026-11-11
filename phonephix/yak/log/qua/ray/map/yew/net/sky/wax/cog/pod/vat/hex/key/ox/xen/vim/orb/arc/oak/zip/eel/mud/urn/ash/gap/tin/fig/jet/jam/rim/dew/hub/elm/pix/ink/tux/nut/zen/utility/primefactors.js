'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'primefactors',
    category: 'utility',
    aliases: [],
    description: 'Break a number into prime factors',
    usage: 'primefactors <number>',
    needsInput: true,
    lines: false,
    run: ({ args }) => {
        let n = Math.floor(Number(args[0]));
        if (!Number.isFinite(n) || n < 2 || n > 1e12) throw new Error('Usage: .primefactors <number from 2 to 1000000000000>');
        const orig = n;
        const f = {};
        for (let p = 2; p * p <= n; p += (p === 2 ? 1 : 2)) {
            while (n % p === 0) { f[p] = (f[p] || 0) + 1; n /= p; }
        }
        if (n > 1) f[n] = (f[n] || 0) + 1;
        const parts = Object.entries(f).map(([p, e]) => (e > 1 ? `${p}^${e}` : p));
        return `🔢 *PRIME FACTORS*\n\n${orig} = ${parts.join(' × ')}${parts.length === 1 && f[orig] === 1 ? '\n\n✅ It is a prime number' : ''}`;
    }
});
