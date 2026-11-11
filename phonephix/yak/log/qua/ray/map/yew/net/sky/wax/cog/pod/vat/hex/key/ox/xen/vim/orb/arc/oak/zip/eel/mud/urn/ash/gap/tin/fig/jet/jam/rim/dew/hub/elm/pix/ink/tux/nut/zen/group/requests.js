'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'requests',
    aliases: ['joinrequests', 'pending'],
    description: '🛂 List people waiting for join approval',
    admin: true,
    botAdmin: true,
    cooldown: 5,
    async run({ sock, from, num, reply }) {
        const list = (await sock.groupRequestParticipantsList(from)) || [];
        if (!list.length) return reply('✅ No pending requests.');
        const lines = list.slice(0, 60).map((r, i) => `${i + 1}. +${num(r.jid || r.id)}`);
        return reply(`🛂 *JOIN REQUESTS (${list.length})*\n\n${lines.join('\n')}\n\nApprove: .approve <number> or .approveall`);
    }
});
