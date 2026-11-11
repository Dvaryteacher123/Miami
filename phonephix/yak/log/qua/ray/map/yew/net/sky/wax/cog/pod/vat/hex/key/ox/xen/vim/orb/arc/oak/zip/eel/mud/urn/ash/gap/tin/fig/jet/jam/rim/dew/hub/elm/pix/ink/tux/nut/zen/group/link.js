'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'link',
    aliases: ['grouplink', 'gclink', 'getlink'],
    description: '🔗 Get the group invite link',
    admin: true,
    botAdmin: true,
    async run({ sock, from, meta, reply }) {
        const code = await sock.groupInviteCode(from);
        return reply(`🔗 *${meta.subject}*\n\nhttps://chat.whatsapp.com/${code}`);
    }
});
