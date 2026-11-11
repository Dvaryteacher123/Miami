'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'raffle',
    emoji: '🎟️',
    aliases: ['draw', 'giveaway'],
    description: '🎟️ Draw random winners (1-10) for a prize',
    usage: 'raffle [winners] [prize]',
    admin: true,
    cooldown: 10,
    async run({ pool, raw, args, num, send }) {
        const n = Math.min(Math.max(parseInt(args[0], 10) || 1, 1), 10);
        const prize = raw.replace(/^\s*\d+\s*/, '').trim() || 'a surprise gift';
        const copy = [...pool];
        const winners = [];
        while (winners.length < n && copy.length) winners.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
        if (!winners.length) return send({ text: '❌ No members to draw from 😅' });
        const list = winners.map((j, i) => `${['🥇', '🥈', '🥉'][i] || '🏅'} @${num(j)}`).join('\n');
        return send({ text: `🎟️ *RAFFLE DRAW*\n\n🎁 Prize: *${prize}*\n\n${list}\n\n🎉 Congratulations to the winner${winners.length > 1 ? 's' : ''}!`, mentions: winners });
    }
});
