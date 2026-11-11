'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'spin',
    emoji: '🍾',
    aliases: ['spinbottle', 'bottle'],
    description: '🍾 Spin the bottle and pick two random members',
    cooldown: 5,
    async run({ pool, pick, num, reply }) {
        if (pool.length < 2) return reply('❌ Not enough members to spin the bottle 😅');
        const a = pick(pool);
        let b = pick(pool);
        while (b === a) b = pick(pool);
        return reply(
            `🍾 *SPIN THE BOTTLE*\n\nThe bottle spins... 🌀🌀🌀\n\n` +
            `@${num(a)} 😳 ➡️ 😘 @${num(b)}\n\n_Just for fun!_ 🎉`,
            [a, b]
        );
    }
});
