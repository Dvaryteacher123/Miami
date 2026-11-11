'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'extractnumbers',
    category: 'utility',
    aliases: [],
    description: 'Pull all numbers out of a text',
    usage: 'extractnumbers <text>',
    needsInput: true,
    lines: false,
    run: ({ text }) => {
        const nums = text.match(/-?\d+(?:[.,]\d+)?/g) || [];
        if (!nums.length) throw new Error('No numbers found');
        const sum = nums.reduce((a, n) => a + Number(n.replace(',', '.')), 0);
        return `🔢 *NUMBERS FOUND* (${nums.length})\n\n${nums.join(', ')}\n\nSum: ${Number(sum.toFixed(6))}`;
    }
});
