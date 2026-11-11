'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'sentencecase',
    category: 'utility',
    aliases: [],
    description: 'Capitalize the first letter of each sentence',
    usage: 'sentencecase <text>',
    needsInput: true,
    lines: false,
    run: ({ text }) =>
        '🔤 *SENTENCE CASE*\n\n' + text.toLowerCase().replace(/(^\s*|[.!?]\s+)(\p{L})/gu, (m, a, b) => a + b.toUpperCase())
});
