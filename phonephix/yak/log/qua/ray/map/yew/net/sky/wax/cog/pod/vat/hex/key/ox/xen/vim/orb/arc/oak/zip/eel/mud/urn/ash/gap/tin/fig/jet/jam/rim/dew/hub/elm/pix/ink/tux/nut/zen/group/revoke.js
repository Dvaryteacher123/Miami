'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'revoke',
    aliases: ['resetlink', 'revokelink'],
    description: '♻️ Revoke the old group link and create a new one',
    admin: true,
    botAdmin: true,
    async run({ sock, from, reply }) {
        const code = await sock.groupRevokeInvite(from);
        return reply(`♻️ *New link created*\n\nhttps://chat.whatsapp.com/${code}\n\nThe old link no longer works.`);
    }
});
