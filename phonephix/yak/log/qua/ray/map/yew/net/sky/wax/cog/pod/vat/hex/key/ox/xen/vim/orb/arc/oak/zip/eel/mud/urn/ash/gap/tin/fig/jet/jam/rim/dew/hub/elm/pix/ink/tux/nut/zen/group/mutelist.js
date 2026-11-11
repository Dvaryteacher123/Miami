'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'mutelist',
    aliases: ['mutedlist', 'listmuted'],
    description: '🔇 List muted members in the group',
    admin: true,
    async run({ store, reply, num }) {
        const { gs } = await store();
        const list = Array.isArray(gs.mutedUsers) ? gs.mutedUsers : [];
        if (!list.length) return reply('✅ Nobody is muted.');
        const lines = list.map((j, i) => `${i + 1}. @${num(j)}`);
        return reply(`🔇 *MUTED MEMBERS (${list.length})*\n\n${lines.join('\n')}`, list.map(String));
    }
});
