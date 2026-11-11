'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'lovepair',
    emoji: '💞',
    aliases: ['pairlove', 'lovematch'],
    description: '💞 Love compatibility between two members (just for fun)',
    usage: 'lovepair @user1 @user2',
    cooldown: 4,
    async run({ mentioned, meJid, pool, pick, num, reply }) {
        let a; let b;
        if (mentioned.length >= 2) { a = mentioned[0]; b = mentioned[1]; }
        else if (mentioned.length === 1) { a = meJid; b = mentioned[0]; }
        else {
            if (pool.length < 2) return reply('❌ Not enough members 💔');
            a = pick(pool);
            do { b = pick(pool); } while (b === a);
        }
        if (!a || !b) return reply('❌ Could not find both people 💔');
        const seed = [num(a), num(b)].sort().join('-');
        let h = 7;
        for (const c of seed) h = (h * 31 + c.charCodeAt(0)) % 101;
        const filled = Math.round(h / 10);
        const bar = '❤️'.repeat(filled) + '🖤'.repeat(10 - filled);
        const verdict = h >= 85 ? 'Soulmates! 💍' : h >= 65 ? 'A great match! 😍' : h >= 45 ? 'There is a spark ✨' : h >= 25 ? 'Just friends 🤝' : 'Not meant to be 💔';
        return reply(
            `💞 *LOVE METER*\n\n@${num(a)} ❤️ @${num(b)}\n\n${bar}\n*${h}%* — ${verdict}\n\n_Just for fun!_ 😄`,
            [a, b]
        );
    }
});
