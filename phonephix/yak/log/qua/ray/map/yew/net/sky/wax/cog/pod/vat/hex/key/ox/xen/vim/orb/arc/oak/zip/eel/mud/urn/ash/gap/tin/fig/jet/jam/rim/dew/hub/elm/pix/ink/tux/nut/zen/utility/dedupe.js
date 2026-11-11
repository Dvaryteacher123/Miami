'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'dedupe',
    category: 'utility',
    aliases: [],
    description: 'Remove duplicate lines or items',
    usage: 'dedupe <lines or a, b, a>',
    needsInput: true,
    lines: true,
    run: ({ text }) => {
        const items = (text.includes('\n') ? text.split(/\r?\n/) : text.split(/\s*[,|]\s*/)).map((s) => s.trim()).filter(Boolean);
        const unique = [...new Set(items)];
        return `🧹 *DEDUPE*\n\nRemoved ${items.length - unique.length} duplicate(s)\n\n${unique.join('\n')}`;
    }
});
