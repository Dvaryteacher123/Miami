'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'wordwrap',
    category: 'utility',
    aliases: [],
    description: 'Wrap text to a maximum line width',
    usage: 'wordwrap <width 10-80> <text>',
    needsInput: true,
    lines: false,
    run: ({ args }) => {
        const width = parseInt(args[0], 10);
        const words = args.slice(1);
        if (!width || width < 10 || width > 80 || !words.length) {
            throw new Error('Usage: .wordwrap <width 10-80> <text>');
        }
        const lines = [];
        let line = '';
        for (const w of words) {
            if ((line + ' ' + w).trim().length > width && line) { lines.push(line); line = w; }
            else line = (line + ' ' + w).trim();
        }
        if (line) lines.push(line);
        return '```' + lines.join('\n') + '```';
    }
});
