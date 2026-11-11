'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'percentchange',
    category: 'utility',
    aliases: [],
    description: 'Percent increase or decrease between two numbers',
    usage: 'percentchange <old> <new>',
    needsInput: true,
    lines: false,
    run: ({ args }) => {
        const a = Number(args[0]);
        const b = Number(args[1]);
        if (!Number.isFinite(a) || !Number.isFinite(b) || a === 0) throw new Error('Usage: .percentchange <old> <new> (old cannot be 0)');
        const p = ((b - a) / Math.abs(a)) * 100;
        return `📈 *PERCENT CHANGE*\n\n${a} → ${b}\n${p >= 0 ? '⬆️ Increase' : '⬇️ Decrease'} of ${Math.abs(p).toFixed(2)}%`;
    }
});
