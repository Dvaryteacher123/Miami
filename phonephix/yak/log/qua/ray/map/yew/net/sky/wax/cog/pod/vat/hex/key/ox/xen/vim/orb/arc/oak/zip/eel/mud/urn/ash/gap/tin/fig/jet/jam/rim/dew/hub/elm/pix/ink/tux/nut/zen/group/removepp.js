'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'removepp',
    aliases: ['delppgc', 'removegcpp'],
    description: '🗑️ Remove the group picture',
    admin: true,
    botAdmin: true,
    async run({ sock, from, reply }) {
        await sock.removeProfilePicture(from);
        return reply('✅ *Group picture removed.*');
    }
});
