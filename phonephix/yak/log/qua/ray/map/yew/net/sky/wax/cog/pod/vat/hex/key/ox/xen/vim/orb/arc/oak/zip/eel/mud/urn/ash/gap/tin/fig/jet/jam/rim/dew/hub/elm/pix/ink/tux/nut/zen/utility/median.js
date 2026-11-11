'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'median',
    category: 'utility',
    aliases: [],
    description: 'Find the median of a list of numbers',
    usage: 'median <numbers>',
    needsInput: true,
    lines: false,
    run: ({ text }) => {
        const n = text.split(/[\s,;]+/).filter(Boolean).map(Number).filter(Number.isFinite).sort((a, b) => a - b);
        if (!n.length) throw new Error('Usage: .median 4 8 15 16 23 42');
        const m = Math.floor(n.length / 2);
        const med = n.length % 2 ? n[m] : (n[m - 1] + n[m]) / 2;
        return `📊 *MEDIAN*\n\nNumbers: ${n.join(', ')}\nMedian: ${med}`;
    }
});
