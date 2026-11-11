'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'hextotext',
    category: 'utility',
    aliases: [],
    description: 'Convert hexadecimal back to text',
    usage: 'hextotext <hex>',
    needsInput: true,
    lines: false,
    run: ({ text }) => {
        const h = text.replace(/0x/gi, '').replace(/[^0-9a-f]/gi, '');
        if (!h || h.length % 2) throw new Error('Invalid hex. Example: .hextotext 48 65 6c 6c 6f');
        return '🔡 *HEX → TEXT*\n\n' + Buffer.from(h, 'hex').toString('utf8');
    }
});
