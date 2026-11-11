'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'texttohex',
    category: 'utility',
    aliases: [],
    description: 'Convert text to hexadecimal',
    usage: 'texttohex <text>',
    needsInput: true,
    lines: false,
    run: ({ text }) =>
        '🔡 *TEXT → HEX*\n\n' + Buffer.from(text, 'utf8').toString('hex').match(/.{1,2}/g).join(' ')
});
