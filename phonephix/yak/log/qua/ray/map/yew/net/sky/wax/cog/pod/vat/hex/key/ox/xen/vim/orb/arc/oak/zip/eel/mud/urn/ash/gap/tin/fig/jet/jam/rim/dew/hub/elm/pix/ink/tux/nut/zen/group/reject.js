'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'reject',
    description: '🚫 Reject a join request (by number)',
    usage: 'reject <number>',
    admin: true,
    botAdmin: true,
    async run({ sock, from, args, num, reply, prefix }) {
        const numbers = args.map((a) => String(a).replace(/[^\d]/g, '')).filter((n) => n.length >= 7);
        if (!numbers.length) return reply(`❌ Enter a number.\n\nExample: ${prefix}reject 255712345678`);
        const pending = (await sock.groupRequestParticipantsList(from)) || [];
        const jids = pending.map((r) => r.jid || r.id).filter((j) => numbers.includes(num(j)));
        if (!jids.length) return reply('❌ Those numbers are not in the request list.');
        await sock.groupRequestParticipantsUpdate(from, jids, 'reject');
        return reply(`✅ Rejected: ${jids.length}`);
    }
});
