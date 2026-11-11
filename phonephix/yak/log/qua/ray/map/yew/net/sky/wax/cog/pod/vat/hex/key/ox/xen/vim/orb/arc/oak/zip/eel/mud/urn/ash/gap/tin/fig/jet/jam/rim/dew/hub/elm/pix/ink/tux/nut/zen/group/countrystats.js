'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');
const { codeOf } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/countryCodes');

module.exports = defineGroup({
    name: 'countrystats',
    emoji: '🌍',
    aliases: ['countries', 'gcountries'],
    description: '🌍 Member count per country (by phone code)',
    cooldown: 8,
    async run({ meta, parts, botNums, partId, phoneOf, num, reply }) {
        const counts = {};
        let total = 0;
        for (const p of parts) {
            if (botNums.includes(num(partId(p)))) continue;
            const c = codeOf(phoneOf(p));
            const key = `${c.name} (+${c.code})`;
            counts[key] = (counts[key] || 0) + 1;
            total += 1;
        }
        const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        if (!rows.length) return reply('❌ No members found 😅');
        const top = rows.slice(0, 15).map(([k, v], i) => `${i + 1}. 🌐 ${k}: *${v}* (${((v / total) * 100).toFixed(1)}%)`);
        const more = rows.length > 15 ? `\n\n…and ${rows.length - 15} more countries` : '';
        return reply(`🌍 *COUNTRIES - ${meta.subject}*\n\n${top.join('\n')}${more}\n\n👥 Total: *${total}*`);
    }
});
