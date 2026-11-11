'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'weekday',
    category: 'utility',
    aliases: [],
    description: 'Find the day of the week for a date',
    usage: 'weekday <YYYY-MM-DD>',
    needsInput: true,
    lines: false,
    run: ({ args }) => {
        const d = new Date(String(args[0] || '') + 'T00:00:00Z');
        if (Number.isNaN(d.getTime())) throw new Error('Usage: .weekday <YYYY-MM-DD>');
        const en = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const sw = ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi'];
        return `📅 *WEEKDAY*\n\n${args[0]} was a ${en[d.getUTCDay()]} (${sw[d.getUTCDay()]})`;
    }
});
