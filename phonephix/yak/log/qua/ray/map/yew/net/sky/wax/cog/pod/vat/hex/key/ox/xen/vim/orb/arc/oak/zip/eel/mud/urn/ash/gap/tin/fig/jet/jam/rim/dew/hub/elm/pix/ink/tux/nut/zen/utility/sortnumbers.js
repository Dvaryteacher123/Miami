'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'sortnumbers',
    category: 'utility',
    aliases: [],
    description: 'Sort numbers (add "desc" for high to low)',
    usage: 'sortnumbers <numbers> [desc]',
    needsInput: true,
    lines: false,
    run: ({ text }) => {
        const desc = /\bdesc\b/i.test(text);
        const n = text.split(/[\s,;]+/).filter(Boolean).map(Number).filter(Number.isFinite);
        if (!n.length) throw new Error('Usage: .sortnumbers 5 2 9 1 [desc]');
        n.sort((a, b) => (desc ? b - a : a - b));
        return `🔢 *SORTED NUMBERS* (${desc ? 'high → low' : 'low → high'})\n\n${n.join(', ')}`;
    }
});
