'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'groupid',
    aliases: ['gid', 'gcid'],
    description: '🆔 Show the group ID (JID)',
    meta: false,
    async run({ from, reply }) {
        return reply(`🆔 *GROUP ID*\n\n${from}`);
    }
});
