'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'exportmembers',
    emoji: '📄',
    aliases: ['memberstxt', 'exporttxt'],
    description: '📄 Export the member list as a .txt file',
    admin: true,
    cooldown: 20,
    async run({ meta, parts, phoneOf, send }) {
        const lines = parts.map((p, i) => `${i + 1}. +${phoneOf(p)}${p.admin === 'superadmin' ? ' (creator)' : p.admin ? ' (admin)' : ''}`);
        const text = `${meta.subject}\nTotal: ${parts.length}\n\n${lines.join('\n')}\n`;
        const safe = String(meta.subject || 'group').replace(/[^\w\-]+/g, '_').slice(0, 40);
        return send({
            document: Buffer.from(text, 'utf-8'),
            mimetype: 'text/plain',
            fileName: `${safe}-members.txt`,
            caption: `📄 *${meta.subject}*\n👥 ${parts.length} members exported ✅`
        });
    }
});
