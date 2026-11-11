'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'vigenere',
    category: 'utility',
    aliases: [],
    description: 'Encode/decode text with the Vigenere cipher',
    usage: 'vigenere <encode|decode> <key> <text>',
    needsInput: true,
    lines: false,
    run: ({ args }) => {
        const mode = String(args[0] || '').toLowerCase();
        const key = String(args[1] || '').replace(/[^a-z]/gi, '').toLowerCase();
        const msg = args.slice(2).join(' ');
        if (!['encode', 'decode'].includes(mode) || !key || !msg) {
            throw new Error('Usage: .vigenere <encode|decode> <key> <text>');
        }
        let k = 0;
        const out = Array.from(msg).map((c) => {
            if (!/[a-z]/i.test(c)) return c;
            const base = c === c.toLowerCase() ? 97 : 65;
            const shift = key.charCodeAt(k++ % key.length) - 97;
            const off = (c.charCodeAt(0) - base + (mode === 'encode' ? shift : 26 - shift)) % 26;
            return String.fromCharCode(base + off);
        }).join('');
        return `🔐 *VIGENERE (${mode})*\n\n${out}`;
    }
});
