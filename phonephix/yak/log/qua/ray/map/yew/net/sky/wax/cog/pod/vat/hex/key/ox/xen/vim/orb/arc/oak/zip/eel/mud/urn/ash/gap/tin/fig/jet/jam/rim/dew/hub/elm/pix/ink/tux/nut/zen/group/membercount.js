'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'membercount',
    aliases: ['totalmembers', 'gcount'],
    description: '👥 Number of group members',
    async run({ meta, parts, isAdminPart, reply }) {
        const admins = parts.filter(isAdminPart);
        return reply(
            `👥 *${meta.subject}*\n\n` +
            `• Total: ${parts.length}\n` +
            `• Admins: ${admins.length}\n` +
            `• Members: ${parts.length - admins.length}`
        );
    }
});
