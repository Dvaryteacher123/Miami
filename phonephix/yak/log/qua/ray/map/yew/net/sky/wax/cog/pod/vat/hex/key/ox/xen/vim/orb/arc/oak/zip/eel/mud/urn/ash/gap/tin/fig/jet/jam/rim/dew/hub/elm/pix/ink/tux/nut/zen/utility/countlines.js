'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'countlines',
    category: 'utility',
    aliases: [],
    description: 'Count lines, words and characters',
    usage: 'countlines <text>',
    needsInput: true,
    lines: true,
    run: ({ text }) => {
        const lines = text.split(/\r?\n/).filter((l) => l.trim()).length;
        const words = text.split(/\s+/).filter(Boolean).length;
        return `📏 *TEXT COUNT*\n\nLines: ${lines}\nWords: ${words}\nCharacters: ${text.length}`;
    }
});
