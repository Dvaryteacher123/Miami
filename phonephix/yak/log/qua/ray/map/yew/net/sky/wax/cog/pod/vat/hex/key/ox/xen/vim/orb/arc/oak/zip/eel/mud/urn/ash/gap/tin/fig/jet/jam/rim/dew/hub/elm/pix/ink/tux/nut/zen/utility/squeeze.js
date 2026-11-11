'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'squeeze',
    category: 'utility',
    aliases: [],
    description: 'Collapse extra spaces and line breaks',
    usage: 'squeeze <text>',
    needsInput: true,
    lines: true,
    run: ({ text }) => {
        const out = text.replace(/\s+/g, ' ').trim();
        return `🧹 *SQUEEZED*\n\nSaved ${text.length - out.length} character(s)\n\n${out}`;
    }
});
