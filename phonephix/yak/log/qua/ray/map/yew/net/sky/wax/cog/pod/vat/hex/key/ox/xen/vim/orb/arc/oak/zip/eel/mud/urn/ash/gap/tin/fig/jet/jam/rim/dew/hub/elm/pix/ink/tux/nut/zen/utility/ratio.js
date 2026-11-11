'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'ratio',
    category: 'utility',
    aliases: [],
    description: 'Simplify a ratio between two numbers',
    usage: 'ratio <a> <b>',
    needsInput: true,
    lines: false,
    run: ({ args }) => {
        const a = Number(args[0]);
        const b = Number(args[1]);
        if (!Number.isFinite(a) || !Number.isFinite(b) || a <= 0 || b <= 0) throw new Error('Usage: .ratio <a> <b> (positive numbers)');
        const dec = Math.max((String(a).split('.')[1] || '').length, (String(b).split('.')[1] || '').length);
        const scale = Math.pow(10, Math.min(dec, 6));
        const x = Math.round(a * scale);
        const y = Math.round(b * scale);
        const g = (u, v) => (v ? g(v, u % v) : u);
        const d = g(x, y);
        return `⚖️ *RATIO*\n\n${a} : ${b}  =  ${x / d} : ${y / d}\n\nDecimal: ${(a / b).toFixed(4)}`;
    }
});
