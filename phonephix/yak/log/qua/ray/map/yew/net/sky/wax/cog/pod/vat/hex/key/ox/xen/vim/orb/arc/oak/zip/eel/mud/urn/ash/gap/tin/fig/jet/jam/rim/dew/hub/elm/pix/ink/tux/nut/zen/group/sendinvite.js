'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'sendinvite',
    aliases: ['invitelink', 'alika'],
    description: '📩 Send the group link to a number (inbox)',
    usage: 'sendinvite <number>',
    admin: true,
    botAdmin: true,
    cooldown: 10,
    async run({ sock, from, meta, args, reply, prefix }) {
        const digits = String(args[0] || '').replace(/[^\d]/g, '');
        if (digits.length < 7) return reply(`❌ Enter a number with the country code.\n\nExample: ${prefix}sendinvite 255712345678`);
        const jid = `${digits}@s.whatsapp.net`;
        const code = await sock.groupInviteCode(from);
        await sock.sendMessage(jid, {
            text: `📩 *Invitation*\n\nYou have been invited to join the group *${meta.subject}*\n\nhttps://chat.whatsapp.com/${code}`
        });
        return reply(`✅ Invitation sent to +${digits}`);
    }
});
