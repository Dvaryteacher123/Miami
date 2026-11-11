'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'creategroup',
    aliases: ['newgroup', 'gcnew'],
    description: '🆕 Create a new group with you inside (owner only)',
    usage: 'creategroup <name>',
    owner: true,
    groupOnly: false,
    meta: false,
    cooldown: 10,
    async run({ ctx, sock, raw, num, reply, prefix }) {
        if (!raw) return reply(`❌ Enter a group name.\n\nExample: ${prefix}creategroup Phonephix Fans`);
        const me = num(ctx.senderJid) || num(ctx.senderPhone);
        if (!me) return reply('❌ Your number could not be found.');
        const res = await sock.groupCreate(raw.slice(0, 100), [`${me}@s.whatsapp.net`]);
        let text = `✅ *Group created*\n\nName: ${res.subject || raw}`;
        try {
            const code = await sock.groupInviteCode(res.id);
            text += `\nLink: https://chat.whatsapp.com/${code}`;
        } catch (_) { /* link unavailable */ }
        return reply(text);
    }
});
