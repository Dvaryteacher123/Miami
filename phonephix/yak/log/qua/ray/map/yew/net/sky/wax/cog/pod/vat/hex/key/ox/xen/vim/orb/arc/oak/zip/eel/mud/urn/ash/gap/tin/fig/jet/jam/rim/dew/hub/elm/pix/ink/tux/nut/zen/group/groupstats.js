'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'groupstats',
    aliases: ['gcstats', 'gstats'],
    description: '📊 Group statistics (count, admins, creator)',
    cooldown: 5,
    async run({ meta, parts, isAdminPart, partId, num, reply }) {
        const admins = parts.filter(isAdminPart);
        const sup = parts.find((p) => p.admin === 'superadmin');
        const owner = meta.owner || (sup && partId(sup));
        const total = parts.length;
        const pct = total ? ((admins.length / total) * 100).toFixed(1) : '0';
        return reply(
            `📊 *${meta.subject}*\n\n` +
            `👥 Total: ${total}\n` +
            `🛡️ Admins: ${admins.length} (${pct}%)\n` +
            `👤 Members: ${total - admins.length}\n` +
            `👑 Creator: ${owner ? '@' + num(owner) : '-'}\n` +
            `💬 Who can send: ${meta.announce ? 'Admins only' : 'Everyone'}`,
            owner ? [owner] : []
        );
    }
});
