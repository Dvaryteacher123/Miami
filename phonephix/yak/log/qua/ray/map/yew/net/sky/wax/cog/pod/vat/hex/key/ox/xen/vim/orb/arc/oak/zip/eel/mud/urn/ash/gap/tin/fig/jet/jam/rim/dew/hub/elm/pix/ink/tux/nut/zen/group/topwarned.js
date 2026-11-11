'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'topwarned',
    emoji: '🚨',
    aliases: ['warnboard', 'warnleaderboard'],
    description: '🚨 Members with the most warnings',
    admin: true,
    cooldown: 5,
    async run({ store, reply }) {
        const { gs } = await store();
        const limit = Number(gs.warnLimit) || Number(process.env.WARN_LIMIT) || 3;
        const rows = Object.entries(gs.warns || {})
            .map(([p, c]) => [p, Number(c) || 0])
            .filter(([, c]) => c > 0)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        if (!rows.length) return reply('✅ Nobody has warnings in this group 🎉');
        const medals = ['🥇', '🥈', '🥉'];
        const lines = rows.map(([p, c], i) => `${medals[i] || '⚠️'} @${p} — *${c}/${limit}*`);
        return reply(`🚨 *MOST WARNED MEMBERS*\n\n${lines.join('\n')}`, rows.map(([p]) => `${p}@s.whatsapp.net`));
    }
});
