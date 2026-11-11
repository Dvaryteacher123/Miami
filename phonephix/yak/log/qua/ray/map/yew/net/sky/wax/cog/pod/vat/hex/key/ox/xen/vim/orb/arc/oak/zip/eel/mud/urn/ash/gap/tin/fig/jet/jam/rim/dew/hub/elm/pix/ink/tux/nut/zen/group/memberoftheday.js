'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'memberoftheday',
    emoji: '🏅',
    aliases: ['motd', 'mod', 'starofday'],
    description: '🏅 Today\'s star member (same person all day)',
    cooldown: 5,
    async run({ pool, from, num, reply }) {
        if (!pool.length) return reply('❌ No members found 😅');
        const sorted = [...pool].sort();
        const seed = new Date().toISOString().slice(0, 10) + from;
        let h = 0;
        for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
        const jid = sorted[h % sorted.length];
        return reply(`🏅 *MEMBER OF THE DAY*\n\n🎉 Congratulations @${num(jid)}! 🎉\n\nYou are today's star! ⭐👑`, [jid]);
    }
});
