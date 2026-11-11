'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'vcf',
    emoji: '📇',
    aliases: ['exportcontacts', 'contactsfile'],
    description: '📇 Export all members as a contacts (.vcf) file',
    admin: true,
    cooldown: 30,
    async run({ meta, parts, phoneOf, botNums, partId, num, send, reply }) {
        const cards = [];
        let i = 0;
        for (const p of parts) {
            if (botNums.includes(num(partId(p)))) continue;
            const phone = phoneOf(p);
            if (phone.length < 7) continue;
            i += 1;
            cards.push(`BEGIN:VCARD\nVERSION:3.0\nFN:${String(meta.subject).replace(/[\r\n;,]/g, ' ').slice(0, 30)} ${i}\nTEL;type=CELL;waid=${phone}:+${phone}\nEND:VCARD`);
        }
        if (!cards.length) return reply('❌ No contacts to export 😅');
        const safe = String(meta.subject || 'group').replace(/[^\w\-]+/g, '_').slice(0, 40);
        return send({
            document: Buffer.from(cards.join('\n'), 'utf-8'),
            mimetype: 'text/x-vcard',
            fileName: `${safe}.vcf`,
            caption: `📇 *${meta.subject}*\n✅ ${cards.length} contacts exported. Open the file to save them.`
        });
    }
});
