'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'pick',
    category: 'fun',
    aliases: [],
    description: 'Pick one option at random',
    usage: 'pick <a, b, c>',
    needsInput: true,
    lines: false,
    run: ({ text }) => {
        const items = (/[,|\n]/.test(text) ? text.split(/[,|\n]/) : text.split(/\s+/)).map((s) => s.trim()).filter(Boolean);
        if (items.length < 2) throw new Error('Give at least 2 options. Example: .pick pizza, burger, chips');
        return `🎯 *I PICK*\n\n👉 ${items[Math.floor(Math.random() * items.length)]}`;
    }
});
