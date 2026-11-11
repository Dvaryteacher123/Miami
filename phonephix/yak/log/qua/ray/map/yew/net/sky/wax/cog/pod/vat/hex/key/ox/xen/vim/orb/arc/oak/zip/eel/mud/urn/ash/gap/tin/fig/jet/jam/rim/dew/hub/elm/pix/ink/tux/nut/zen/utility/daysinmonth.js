'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'daysinmonth',
    category: 'utility',
    aliases: [],
    description: 'Number of days in a month',
    usage: 'daysinmonth [year] [month]',
    needsInput: false,
    lines: false,
    run: ({ args }) => {
        const now = new Date();
        const y = args[0] ? parseInt(args[0], 10) : now.getUTCFullYear();
        const m = args[1] ? parseInt(args[1], 10) : now.getUTCMonth() + 1;
        if (!y || y < 1 || y > 9999 || !m || m < 1 || m > 12) throw new Error('Usage: .daysinmonth <year> <month 1-12>');
        return `📅 *DAYS IN MONTH*\n\n${y}-${String(m).padStart(2, '0')} has ${new Date(Date.UTC(y, m, 0)).getUTCDate()} days`;
    }
});
