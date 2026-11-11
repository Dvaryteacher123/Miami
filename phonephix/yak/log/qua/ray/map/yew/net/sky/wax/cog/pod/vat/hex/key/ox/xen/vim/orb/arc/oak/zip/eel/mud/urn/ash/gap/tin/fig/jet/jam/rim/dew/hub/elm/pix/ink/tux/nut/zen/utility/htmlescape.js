'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'htmlescape',
    category: 'utility',
    aliases: [],
    description: 'Escape special characters for HTML',
    usage: 'htmlescape <text>',
    needsInput: true,
    lines: false,
    run: ({ text }) =>
        '🧾 *HTML ESCAPED*\n\n' + text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
});
