'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'lockinfo',
    aliases: ['lockedit', 'lockgc'],
    description: '🔒 Only admins can edit the group name/picture/description',
    admin: true,
    botAdmin: true,
    async run({ sock, from, reply }) {
        await sock.groupSettingUpdate(from, 'locked');
        return reply('🔒 Only *admins* can edit group info now.');
    }
});
