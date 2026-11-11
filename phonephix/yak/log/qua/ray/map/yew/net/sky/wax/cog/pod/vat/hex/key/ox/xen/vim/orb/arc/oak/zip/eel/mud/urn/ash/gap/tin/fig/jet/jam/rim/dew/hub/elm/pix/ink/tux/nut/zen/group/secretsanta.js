'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');
const shuffle = (a) => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };



module.exports = defineGroup({
    name: 'secretsanta',
    emoji: '🎅',
    aliases: ['santa', 'giftdraw'],
    description: '🎅 Draw Secret Santa pairs (mention 3+ people, or use a number for random members)',
    usage: 'secretsanta @a @b @c  |  secretsanta 6',
    cooldown: 10,
    async run({ mentioned, pool, args, num, reply }) {
        let list = mentioned.length >= 3 ? [...new Set(mentioned)] : null;
        if (!list) {
            const n = Math.min(Math.max(parseInt(args[0], 10) || 6, 3), 20);
            list = shuffle(pool).slice(0, n);
        }
        if (list.length < 3) return reply('❌ Need at least 3 people for Secret Santa 🎅');
        const order = shuffle(list);
        const lines = order.map((giver, i) => `🎁 @${num(giver)} ➡️ @${num(order[(i + 1) % order.length])}`);
        return reply(`🎅 *SECRET SANTA*\n\n${lines.join('\n')}\n\n🤫 Keep who you got a secret! 🎄`, order);
    }
});
