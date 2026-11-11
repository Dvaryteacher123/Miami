'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'd20',
    category: 'fun',
    aliases: [],
    description: 'Roll dice (default one 20-sided die)',
    usage: 'd20 [sides] [count]',
    needsInput: false,
    lines: false,
    run: ({ args }) => {
        const sides = Math.min(1000, Math.max(2, parseInt(args[0], 10) || 20));
        const count = Math.min(20, Math.max(1, parseInt(args[1], 10) || 1));
        const rolls = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * sides));
        const sum = rolls.reduce((a, b) => a + b, 0);
        return `🎲 *D${sides} x${count}*\n\n${rolls.join(', ')}${count > 1 ? `\n\nTotal: ${sum}` : ''}`;
    }
});
