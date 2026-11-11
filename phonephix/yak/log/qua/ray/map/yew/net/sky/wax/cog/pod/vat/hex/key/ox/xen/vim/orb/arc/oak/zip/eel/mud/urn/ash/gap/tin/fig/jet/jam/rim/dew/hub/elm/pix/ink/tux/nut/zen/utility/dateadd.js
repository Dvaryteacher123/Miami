'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'dateadd',
    category: 'utility',
    aliases: [],
    description: 'Add or subtract days from a date',
    usage: 'dateadd <YYYY-MM-DD> <days>',
    needsInput: true,
    lines: false,
    run: ({ args }) => {
        const d = new Date(String(args[0] || '') + 'T00:00:00Z');
        const n = parseInt(args[1], 10);
        if (Number.isNaN(d.getTime()) || Number.isNaN(n)) throw new Error('Usage: .dateadd <YYYY-MM-DD> <days (can be negative)>');
        d.setUTCDate(d.getUTCDate() + n);
        const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `📅 *DATE ADD*\n\n${args[0]} ${n >= 0 ? '+' : '-'} ${Math.abs(n)} day(s)\n= ${d.toISOString().slice(0, 10)} (${names[d.getUTCDay()]})`;
    }
});
