'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'tagmembers',
    aliases: ['tagnonadmins', 'tagmem'],
    description: '📢 Tag all non-admin members',
    usage: 'tagmembers [message]',
    admin: true,
    cooldown: 5,
    async run({ send, members, partId, num, raw }) {
        const jids = members.map(partId).filter(Boolean);
        if (!jids.length) return send({ text: '❌ No regular members found.' });
        const msg = raw || 'Attention!';
        return send({
            text: `📢 *MEMBERS*\n\n${msg}\n\n${jids.map((j) => `@${num(j)}`).join(' ')}`,
            mentions: jids
        });
    }
});
