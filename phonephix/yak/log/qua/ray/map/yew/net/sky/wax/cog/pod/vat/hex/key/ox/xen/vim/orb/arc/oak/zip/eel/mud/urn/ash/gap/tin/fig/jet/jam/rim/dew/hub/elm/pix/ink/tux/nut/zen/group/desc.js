'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'desc',
    aliases: ['gcdesc', 'groupdesc'],
    description: '📝 Show the group description',
    async run({ meta, reply }) {
        const d = String(meta.desc || '').trim();
        return reply(d ? `📝 *${meta.subject}*\n\n${d}` : '📝 This group has no description.');
    }
});
