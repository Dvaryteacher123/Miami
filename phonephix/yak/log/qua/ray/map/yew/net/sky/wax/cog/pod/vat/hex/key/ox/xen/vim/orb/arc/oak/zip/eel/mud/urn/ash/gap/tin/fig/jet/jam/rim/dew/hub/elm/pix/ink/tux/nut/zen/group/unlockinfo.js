'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'unlockinfo',
    aliases: ['unlockedit', 'unlockgc'],
    description: '🔓 Let all members edit group info',
    admin: true,
    botAdmin: true,
    async run({ sock, from, reply }) {
        await sock.groupSettingUpdate(from, 'unlocked');
        return reply('🔓 *All members* can edit group info now.');
    }
});
