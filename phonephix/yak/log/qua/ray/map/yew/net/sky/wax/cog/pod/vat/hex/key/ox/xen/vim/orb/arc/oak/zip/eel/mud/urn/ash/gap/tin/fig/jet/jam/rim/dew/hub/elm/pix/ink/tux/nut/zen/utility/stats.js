'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'stats',
    category: 'utility',
    aliases: [],
    description: 'Mean, median, min, max and spread of numbers',
    usage: 'stats <numbers>',
    needsInput: true,
    lines: false,
    run: ({ text }) => {
        const n = text.split(/[\s,;]+/).filter(Boolean).map(Number).filter(Number.isFinite);
        if (!n.length) throw new Error('Usage: .stats 4 8 15 16 23 42');
        const s = [...n].sort((a, b) => a - b);
        const sum = n.reduce((a, b) => a + b, 0);
        const mean = sum / n.length;
        const m = Math.floor(s.length / 2);
        const med = s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
        const variance = n.reduce((a, b) => a + (b - mean) ** 2, 0) / n.length;
        const f = (x) => Number(x.toFixed(4));
        return `📊 *STATS*\n\nCount: ${n.length}\nSum: ${f(sum)}\nMean: ${f(mean)}\nMedian: ${f(med)}\nMin: ${s[0]}\nMax: ${s[s.length - 1]}\nRange: ${f(s[s.length - 1] - s[0])}\nStd dev: ${f(Math.sqrt(variance))}`;
    }
});
