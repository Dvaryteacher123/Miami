'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'couple',
    aliases: ['ship', 'wapenzi'],
    description: '💘 Pick a random couple (just for fun)',
    cooldown: 5,
    async run({ parts, partId, num, sock, reply }) {
        const botNums = [sock.user?.id, sock.user?.lid].filter(Boolean).map(num);
        const pool = parts.map(partId).filter((j) => !botNums.includes(num(j)));
        if (pool.length < 2) return reply('❌ Not enough members.');
        const a = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
        const b = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
        const pct = 50 + Math.floor(Math.random() * 51);
        return reply(`💘 *COUPLE OF THE DAY*\n\n@${num(a)} ❤️ @${num(b)}\n\nLove: *${pct}%*\n\n_(Just for fun 😄)_`, [a, b]);
    }
});
