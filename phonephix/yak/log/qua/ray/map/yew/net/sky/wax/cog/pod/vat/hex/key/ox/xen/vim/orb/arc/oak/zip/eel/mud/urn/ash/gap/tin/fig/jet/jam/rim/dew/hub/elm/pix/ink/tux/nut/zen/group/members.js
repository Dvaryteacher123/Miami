'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'members',
    aliases: ['listmembers', 'memberlist'],
    description: '👥 List group members (numbers)',
    admin: true,
    cooldown: 5,
    async run({ meta, parts, num, reply }) {
        const LIMIT = 100;
        const lines = parts.slice(0, LIMIT).map((p, i) => `${i + 1}. +${num(p.id || p.jid)}${p.admin ? ' 👑' : ''}`);
        const more = parts.length > LIMIT ? `\n\n…and ${parts.length - LIMIT} more` : '';
        return reply(`👥 *${meta.subject}*\nTotal: ${parts.length}\n\n${lines.join('\n')}${more}`);
    }
});
