'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'tagadmins',
    aliases: ['calladmins', 'pingadmins'],
    description: '🚨 Tag all group admins',
    usage: 'tagadmins [message]',
    cooldown: 10,
    async run({ send, admins, partId, num, raw }) {
        const jids = admins.map(partId).filter(Boolean);
        if (!jids.length) return send({ text: '❌ No admins found.' });
        const msg = raw || 'Help needed!';
        return send({
            text: `🚨 *ADMINS*\n\n${msg}\n\n${jids.map((j) => `@${num(j)}`).join(' ')}`,
            mentions: jids
        });
    }
});
