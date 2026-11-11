'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'uniquewords',
    category: 'utility',
    aliases: [],
    description: 'List the unique words in a text',
    usage: 'uniquewords <text>',
    needsInput: true,
    lines: false,
    run: ({ text }) => {
        const words = text.toLowerCase().replace(/[^\p{L}\p{N}'\s-]/gu, '').split(/\s+/).filter(Boolean);
        const set = [...new Set(words)];
        return `🔠 *UNIQUE WORDS*\n\nTotal words: ${words.length}\nUnique: ${set.length}\n\n${set.slice(0, 100).join(', ')}`;
    }
});
