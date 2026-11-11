'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'highfive',
    emoji: '✋',
    aliases: ['hi5', 'fiveup'],
    description: '✋ Give someone a high five',
    usage: 'highfive [@user]',
    cooldown: 3,
    async run({ resolveTarget, meJid, pool, pick, num, reply }) {
        const t = resolveTarget({ allowNumber: false });
        const target = t ? t.jid : pick(pool);
        if (!target) return reply('❌ Nobody to high-five 😅');
        const me = meJid || target;
        if (num(me) === num(target)) return reply(`✋ @${num(me)} high-fived themselves. Legend! 😎`, [me]);
        return reply(`✋ @${num(me)} ${pick(['gave a huge high five to 🙌', 'high-fived', 'slapped hands with'])} @${num(target)}`, [me, target]);
    }
});
