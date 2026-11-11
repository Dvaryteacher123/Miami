'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'linkinfo',
    aliases: ['checklink', 'gcinfo'],
    description: '🔎 View group info from its invite link',
    usage: 'linkinfo <link>',
    groupOnly: false,
    meta: false,
    cooldown: 5,
    async run({ sock, raw, reply, prefix }) {
        const m = raw.match(/chat\.whatsapp\.com\/([A-Za-z0-9]{10,})/);
        if (!m) return reply(`❌ Provide a group link.\n\nExample: ${prefix}linkinfo https://chat.whatsapp.com/xxxxxxxx`);
        const info = await sock.groupGetInviteInfo(m[1]);
        const created = info.creation ? new Date(info.creation * 1000).toISOString().slice(0, 10) : '-';
        return reply(
            `🔎 *${info.subject}*\n\n` +
            `Members: ${info.size ?? (info.participants || []).length}\n` +
            `Created: ${created}\n` +
            `ID: ${info.id}\n\n` +
            `${info.desc ? `📝 ${String(info.desc).slice(0, 500)}` : ''}`.trimEnd()
        );
    }
});
