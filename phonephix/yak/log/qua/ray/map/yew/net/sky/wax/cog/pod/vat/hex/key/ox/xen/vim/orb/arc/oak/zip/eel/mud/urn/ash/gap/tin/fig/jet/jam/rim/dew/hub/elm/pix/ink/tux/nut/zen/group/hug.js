'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'hug',
    emoji: '🤗',
    aliases: ['cuddle'],
    description: '🤗 Give someone a warm hug',
    usage: 'hug [@user]',
    cooldown: 3,
    async run({ resolveTarget, meJid, pool, pick, num, reply }) {
        const t = resolveTarget({ allowNumber: false });
        const target = t ? t.jid : pick(pool);
        if (!target) return reply('❌ Nobody to hug 😅');
        const me = meJid || target;
        if (num(me) === num(target)) return reply(`🤗 @${num(me)} hugged themselves. Self-love is important! 💖`, [me]);
        return reply(`🤗 @${num(me)} ${pick(['gave a big warm hug to', 'hugged tightly ❤️', 'sent a comforting hug to'])} @${num(target)}`, [me, target]);
    }
});
