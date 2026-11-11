'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'extractemails',
    category: 'utility',
    aliases: [],
    description: 'Find all email addresses in a text',
    usage: 'extractemails <text>',
    needsInput: true,
    lines: false,
    run: ({ text }) => {
        const m = text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || [];
        if (!m.length) throw new Error('No email addresses found');
        return `📧 *EMAILS FOUND* (${m.length})\n\n${[...new Set(m)].join('\n')}`;
    }
});
