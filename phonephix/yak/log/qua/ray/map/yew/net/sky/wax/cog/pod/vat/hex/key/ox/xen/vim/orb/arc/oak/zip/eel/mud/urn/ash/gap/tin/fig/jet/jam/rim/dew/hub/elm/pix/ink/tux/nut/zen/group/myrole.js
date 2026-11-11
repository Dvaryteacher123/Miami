'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'myrole',
    emoji: '🪪',
    aliases: ['whoami', 'myinfo'],
    description: '🪪 See your role and number in this group',
    cooldown: 4,
    async run({ senderPart, phoneOf, meta, meJid, num, reply }) {
        const role = !senderPart ? 'Unknown ❔' : senderPart.admin === 'superadmin' ? 'Group Creator 👑' : senderPart.admin === 'admin' ? 'Admin 🛡️' : 'Member 👤';
        const phone = senderPart ? phoneOf(senderPart) : num(meJid);
        return reply(`🪪 *YOUR ROLE*\n\n👥 Group: ${meta.subject}\n🙋 You: @${num(meJid || phone)}\n📱 Number: +${phone}\n🏷️ Role: ${role}`, meJid ? [meJid] : []);
    }
});
