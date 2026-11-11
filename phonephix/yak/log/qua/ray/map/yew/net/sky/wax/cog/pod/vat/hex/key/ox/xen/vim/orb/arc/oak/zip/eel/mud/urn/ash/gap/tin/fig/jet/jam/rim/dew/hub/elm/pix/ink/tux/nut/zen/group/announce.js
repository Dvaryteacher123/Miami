'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'announce',
    emoji: '📢',
    aliases: ['announcement', 'broadcastgc'],
    description: '📢 Post a formatted announcement (notifies everyone silently)',
    usage: 'announce <message>',
    admin: true,
    cooldown: 20,
    async run({ pool, meJid, meta, raw, num, send, reply, prefix }) {
        if (!raw) return reply(`❌ Write the announcement 📢\n\nExample: ${prefix}announce Exams start Monday`);
        const by = meJid ? `\n\n✍️ By @${num(meJid)}` : '';
        return send({
            text: `📢 *ANNOUNCEMENT*\n━━━━━━━━━━━━━━\n\n${raw.slice(0, 2500)}\n\n━━━━━━━━━━━━━━\n👥 ${meta.subject}${by}`,
            mentions: [...new Set([...pool, meJid].filter(Boolean))]
        });
    }
});
