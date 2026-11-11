'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'demoteall',
    emoji: '⬇️',
    aliases: ['removealladmins', 'clearadmins'],
    description: '⬇️ Demote all admins except the creator (creator/owner only)',
    admin: true,
    botAdmin: true,
    cooldown: 20,
    async run({ sock, from, admins, senderPart, isOwner, partId, reply, sleep }) {
        const isCreator = !!(senderPart && senderPart.admin === 'superadmin');
        if (!isOwner && !isCreator) return reply('👑 Only the group creator (or the bot owner) can use this command.');
        const targets = admins.filter((p) => p.admin !== 'superadmin');
        if (!targets.length) return reply('✅ There are no other admins to demote.');
        let done = 0;
        for (let i = 0; i < targets.length; i += 5) {
            const batch = targets.slice(i, i + 5).map(partId);
            try {
                await sock.groupParticipantsUpdate(from, batch, 'demote');
                done += batch.length;
            } catch (_) { /* skip failed batch */ }
            await sleep(1200);
        }
        return reply(`⬇️ *ADMINS DEMOTED*\n\n✅ Demoted *${done}/${targets.length}* admin(s).`);
    }
});
