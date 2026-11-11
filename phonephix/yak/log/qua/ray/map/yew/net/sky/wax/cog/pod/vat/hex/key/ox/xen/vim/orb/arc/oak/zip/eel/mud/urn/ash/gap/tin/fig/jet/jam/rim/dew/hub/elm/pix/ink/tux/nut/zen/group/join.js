'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'join',
    aliases: ['joingroup', 'joingc'],
    description: '🔗 Make the bot join a group via link (owner only)',
    usage: 'join <link>',
    owner: true,
    groupOnly: false,
    meta: false,
    cooldown: 5,
    async run({ sock, raw, reply, prefix }) {
        const m = raw.match(/chat\.whatsapp\.com\/([A-Za-z0-9]{10,})/);
        if (!m) return reply(`❌ Provide a group link.\n\nExample: ${prefix}join https://chat.whatsapp.com/xxxxxxxx`);
        const id = await sock.groupAcceptInvite(m[1]);
        return reply(id ? '✅ Joined the group.' : '✅ Join request sent (the group needs admin approval).');
    }
});
