'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'unmuteall',
    aliases: ['clearmutes'],
    description: '🔊 Unmute everyone in the group',
    admin: true,
    async run({ store, reply }) {
        const { gs, save } = await store();
        const n = Array.isArray(gs.mutedUsers) ? gs.mutedUsers.length : 0;
        if (!n) return reply('✅ Nobody is muted.');
        gs.mutedUsers = [];
        await save();
        return reply(`🔊 Unmuted *${n}* member(s).`);
    }
});
