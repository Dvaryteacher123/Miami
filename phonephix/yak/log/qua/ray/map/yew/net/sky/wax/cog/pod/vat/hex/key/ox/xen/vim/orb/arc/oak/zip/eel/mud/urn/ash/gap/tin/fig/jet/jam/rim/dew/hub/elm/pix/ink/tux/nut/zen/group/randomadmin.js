'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'randomadmin',
    aliases: ['randadmin'],
    description: '👑 Pick a random admin',
    async run({ admins, partId, pick, num, reply }) {
        if (!admins.length) return reply('❌ No admins.');
        const jid = partId(pick(admins));
        return reply(`👑 Selected admin: @${num(jid)}`, [jid]);
    }
});
