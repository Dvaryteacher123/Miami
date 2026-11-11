'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'randommember',
    aliases: ['randmember', 'mtuyeyote'],
    description: '🎲 Pick a random member',
    async run({ parts, partId, pick, num, reply }) {
        if (!parts.length) return reply('❌ No members.');
        const jid = partId(pick(parts));
        return reply(`🎲 The chosen one is: @${num(jid)} 🎉`, [jid]);
    }
});
