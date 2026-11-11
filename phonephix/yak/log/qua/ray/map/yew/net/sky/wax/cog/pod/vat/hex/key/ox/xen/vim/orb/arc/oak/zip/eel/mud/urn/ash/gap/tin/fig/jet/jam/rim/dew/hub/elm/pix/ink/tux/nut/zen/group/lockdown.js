'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'lockdown',
    emoji: '🚨',
    aliases: ['emergency', 'panic'],
    description: '🚨 Emergency mode: only admins can chat AND edit group info',
    admin: true,
    botAdmin: true,
    cooldown: 10,
    async run({ sock, from, reply, prefix }) {
        await sock.groupSettingUpdate(from, 'announcement');
        await sock.groupSettingUpdate(from, 'locked');
        return reply(`🚨 *LOCKDOWN ACTIVATED* 🔒\n\n💬 Only admins can send messages.\n✏️ Only admins can edit group info.\n\nUse *${prefix}liftlockdown* to go back to normal.`);
    }
});
