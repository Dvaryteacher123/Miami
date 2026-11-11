'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'liftlockdown',
    emoji: '✅',
    aliases: ['endlockdown', 'unlockdown'],
    description: '✅ End lockdown: everyone can chat and edit group info again',
    admin: true,
    botAdmin: true,
    cooldown: 10,
    async run({ sock, from, reply }) {
        await sock.groupSettingUpdate(from, 'not_announcement');
        await sock.groupSettingUpdate(from, 'unlocked');
        return reply('✅ *LOCKDOWN LIFTED* 🔓\n\n💬 Everyone can send messages again.\n✏️ Everyone can edit group info again.');
    }
});
