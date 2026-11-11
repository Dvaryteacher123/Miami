'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'greet',
    category: 'general',
    aliases: ['salamu'],
    description: 'Friendly greeting based on the time of day',
    usage: 'greet',
    needsInput: false,
    lines: false,
    run: ({ ctx }) => {
        const h = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Dar_es_Salaam', hour: '2-digit', hour12: false }).format(new Date())) % 24;
        const g = h >= 4 && h < 12 ? 'Good morning' : h < 16 ? 'Good afternoon' : h < 19 ? 'Good evening' : 'Good night';
        const name = (ctx && ctx.msg && ctx.msg.pushName) || '';
        return `👋 *${g}${name ? ', ' + name : ''}!*\n\nWelcome! Type ${ctx.prefix || '.'}menu to see all commands.`;
    }
});
