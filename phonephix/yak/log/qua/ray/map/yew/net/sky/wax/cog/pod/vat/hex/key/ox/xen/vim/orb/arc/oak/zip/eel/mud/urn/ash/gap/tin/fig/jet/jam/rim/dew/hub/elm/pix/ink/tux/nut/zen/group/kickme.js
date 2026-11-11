'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'kickme',
    emoji: '🚪',
    aliases: ['removeme', 'leaveme'],
    description: '🚪 Remove yourself from the group (members only)',
    botAdmin: true,
    cooldown: 10,
    async run({ sock, from, senderPart, meJid, isOwner, num, send, reply }) {
        if (!senderPart) return reply('❌ I could not find you in this group 😅');
        if (senderPart.admin) return reply('❌ Admins cannot use this command. Ask another admin to demote you first 🛡️');
        if (isOwner) return reply('👑 The bot owner cannot be removed with this command.');
        const jid = senderPart.id || senderPart.jid || meJid;
        await send({ text: `🚪 Goodbye @${num(jid)}! You asked to leave. Take care! 👋`, mentions: [jid] });
        await sock.groupParticipantsUpdate(from, [jid], 'remove');
    }
});
