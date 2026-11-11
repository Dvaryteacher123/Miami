'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'sortlines',
    category: 'utility',
    aliases: [],
    description: 'Sort lines (or comma separated items) A-Z',
    usage: 'sortlines <lines or a, b, c>',
    needsInput: true,
    lines: true,
    run: ({ text }) => {
        const items = (text.includes('\n') ? text.split(/\r?\n/) : text.split(/\s*[,|]\s*/)).map((s) => s.trim()).filter(Boolean);
        return '🔤 *SORTED*\n\n' + items.sort((a, b) => a.localeCompare(b)).join('\n');
    }
});
