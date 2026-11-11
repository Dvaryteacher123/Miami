'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'approveall',
    description: '✅ Approve all pending join requests',
    admin: true,
    botAdmin: true,
    cooldown: 5,
    async run({ sock, from, reply }) {
        const pending = (await sock.groupRequestParticipantsList(from)) || [];
        const jids = pending.map((r) => r.jid || r.id).filter(Boolean);
        if (!jids.length) return reply('✅ No pending requests.');
        // small batches so WhatsApp does not reject
        for (let i = 0; i < jids.length; i += 20) {
            await sock.groupRequestParticipantsUpdate(from, jids.slice(i, i + 20), 'approve');
        }
        return reply(`✅ Approved: ${jids.length}`);
    }
});
