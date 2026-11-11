'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'groupcreated',
    aliases: ['gcage', 'groupage'],
    description: '📅 When the group was created',
    async run({ meta, reply }) {
        const ts = Number(meta.creation) || 0;
        if (!ts) return reply('❌ Creation date is not available.');
        const d = new Date(ts * 1000);
        const days = Math.floor((Date.now() - d.getTime()) / 86400000);
        return reply(
            `📅 *${meta.subject}*\n\n` +
            `Created: ${d.toISOString().slice(0, 10)}\n` +
            `Age: ${days} days (~${(days / 365).toFixed(1)} years)`
        );
    }
});
