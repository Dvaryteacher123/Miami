'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'groupowner',
    aliases: ['gcowner', 'creator'],
    description: '👑 Show who created the group',
    async run({ meta, parts, partId, num, reply }) {
        const sup = parts.find((p) => p.admin === 'superadmin');
        const jid = meta.owner || (sup && partId(sup));
        if (!jid) return reply('❌ Group creator not found.');
        return reply(`👑 *GROUP CREATOR*\n\n@${num(jid)}`, [jid]);
    }
});
