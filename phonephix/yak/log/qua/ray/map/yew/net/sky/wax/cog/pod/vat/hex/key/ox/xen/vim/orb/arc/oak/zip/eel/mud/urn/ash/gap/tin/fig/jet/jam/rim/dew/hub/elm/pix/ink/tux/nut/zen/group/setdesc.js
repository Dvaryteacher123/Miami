'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'setdesc',
    aliases: ['setgcdesc', 'changedesc'],
    description: '📝 Change the group description',
    usage: 'setdesc <text>',
    admin: true,
    botAdmin: true,
    async run({ sock, from, raw, reply, prefix }) {
        if (!raw) return reply(`❌ Enter the new description.\n\nExample: ${prefix}setdesc Welcome to our group`);
        await sock.groupUpdateDescription(from, raw.slice(0, 2000));
        return reply('✅ *Group description updated.*');
    }
});
