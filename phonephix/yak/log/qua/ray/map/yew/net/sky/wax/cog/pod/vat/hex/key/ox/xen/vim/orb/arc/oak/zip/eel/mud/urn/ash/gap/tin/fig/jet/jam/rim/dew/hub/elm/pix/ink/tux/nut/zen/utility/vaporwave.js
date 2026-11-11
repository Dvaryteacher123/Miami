'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'vaporwave',
    category: 'utility',
    aliases: [],
    description: 'Turn text into ｖａｐｏｒｗａｖｅ style',
    usage: 'vaporwave <text>',
    needsInput: true,
    lines: false,
    run: ({ text }) =>
        '🌊 *VAPORWAVE*\n\n' +
        Array.from(text).map((c) => {
            const n = c.charCodeAt(0);
            return n > 32 && n < 127 ? String.fromCharCode(n + 0xFEE0) : (c === ' ' ? '　' : c);
        }).join('')
});
