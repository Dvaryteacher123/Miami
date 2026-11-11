'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'ratethis',
    emoji: '⭐',
    aliases: ['ratepoll', 'stars'],
    description: '⭐ Star-rating poll (1-5) for anything',
    usage: 'ratethis <what to rate>',
    meta: false,
    cooldown: 8,
    async run({ raw, send, reply, prefix }) {
        if (!raw) return reply(`❌ What should we rate? ⭐\n\nExample: ${prefix}ratethis Today's lesson`);
        return send({
            poll: {
                name: `⭐ Rate: ${raw.slice(0, 230)}`,
                values: ['⭐ 1', '⭐⭐ 2', '⭐⭐⭐ 3', '⭐⭐⭐⭐ 4', '⭐⭐⭐⭐⭐ 5'],
                selectableCount: 1
            }
        });
    }
});
