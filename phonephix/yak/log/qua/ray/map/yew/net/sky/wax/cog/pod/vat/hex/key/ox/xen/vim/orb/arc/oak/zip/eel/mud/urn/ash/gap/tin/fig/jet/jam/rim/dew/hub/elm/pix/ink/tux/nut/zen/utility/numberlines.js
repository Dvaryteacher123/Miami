'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'numberlines',
    category: 'utility',
    aliases: [],
    description: 'Add numbers to each line or item',
    usage: 'numberlines <lines or a, b, c>',
    needsInput: true,
    lines: true,
    run: ({ text }) => {
        const items = (text.includes('\n') ? text.split(/\r?\n/) : text.split(/\s*[,|]\s*/)).map((s) => s.trim()).filter(Boolean);
        return '🔢 *NUMBERED*\n\n' + items.map((s, i) => `${i + 1}. ${s}`).join('\n');
    }
});
