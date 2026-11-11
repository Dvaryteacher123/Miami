'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'randomorder',
    category: 'fun',
    aliases: [],
    description: 'Shuffle a list into random order',
    usage: 'randomorder <a, b, c>',
    needsInput: true,
    lines: false,
    run: ({ text }) => {
        const items = (/[,|\n]/.test(text) ? text.split(/[,|\n]/) : text.split(/\s+/)).map((s) => s.trim()).filter(Boolean);
        if (items.length < 2) throw new Error('Give at least 2 items. Example: .randomorder ali juma neema');
        for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [items[i], items[j]] = [items[j], items[i]]; }
        return '🔀 *RANDOM ORDER*\n\n' + items.map((s, i) => `${i + 1}. ${s}`).join('\n');
    }
});
