'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'extracturls',
    category: 'utility',
    aliases: [],
    description: 'Find all links in a text',
    usage: 'extracturls <text>',
    needsInput: true,
    lines: false,
    run: ({ text }) => {
        const m = text.match(/https?:\/\/[^\s<>"']+/gi) || [];
        if (!m.length) throw new Error('No links found');
        return `🔗 *LINKS FOUND* (${m.length})\n\n${[...new Set(m)].join('\n')}`;
    }
});
