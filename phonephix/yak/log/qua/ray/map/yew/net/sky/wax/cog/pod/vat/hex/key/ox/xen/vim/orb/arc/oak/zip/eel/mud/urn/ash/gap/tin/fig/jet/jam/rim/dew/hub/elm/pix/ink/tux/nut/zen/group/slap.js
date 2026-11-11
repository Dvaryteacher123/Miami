'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'slap',
    emoji: '👋',
    aliases: ['smack'],
    description: '👋 Slap someone (just for fun)',
    usage: 'slap [@user]',
    cooldown: 3,
    async run({ resolveTarget, meJid, pool, pick, num, reply }) {
        const t = resolveTarget({ allowNumber: false });
        const target = t ? t.jid : pick(pool);
        if (!target) return reply('❌ Nobody to slap 😅');
        const me = meJid || target;
        if (num(me) === num(target)) return reply(`😂 @${num(me)} slapped themselves! Why though?`, [me]);
        return reply(`👋 @${num(me)} ${pick(['slapped', 'gave a mighty slap to', 'slapped with a wet fish 🐟'])} @${num(target)}`, [me, target]);
    }
});
