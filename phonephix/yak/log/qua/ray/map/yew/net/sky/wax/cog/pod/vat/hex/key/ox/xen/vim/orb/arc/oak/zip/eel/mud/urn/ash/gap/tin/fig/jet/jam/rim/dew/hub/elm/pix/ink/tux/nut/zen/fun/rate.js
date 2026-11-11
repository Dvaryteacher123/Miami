'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'rate',
    category: 'fun',
    aliases: [],
    description: 'Rate anything from 0 to 100%',
    usage: 'rate <anything>',
    needsInput: true,
    lines: false,
    run: ({ text }) => {
        let h = 0;
        for (const c of text.toLowerCase()) h = (h * 31 + c.charCodeAt(0)) >>> 0;
        const pct = h % 101;
        const filled = Math.round(pct / 10);
        return `⭐ *RATING*\n\n"${text}"\n${'█'.repeat(filled)}${'░'.repeat(10 - filled)} ${pct}%`;
    }
});
