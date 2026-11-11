'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'sortwords',
    category: 'utility',
    aliases: [],
    description: 'Sort words alphabetically',
    usage: 'sortwords <words>',
    needsInput: true,
    lines: false,
    run: ({ text }) =>
        '🔤 *SORTED WORDS*\n\n' + text.split(/\s+/).filter(Boolean).sort((a, b) => a.localeCompare(b)).join(' ')
});
