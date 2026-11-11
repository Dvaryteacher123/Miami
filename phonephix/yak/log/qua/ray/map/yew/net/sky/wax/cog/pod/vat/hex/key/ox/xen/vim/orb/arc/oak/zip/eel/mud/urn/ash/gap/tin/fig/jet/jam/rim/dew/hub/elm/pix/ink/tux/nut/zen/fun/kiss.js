'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'kiss',
    emoji: '💋',
    aliases: ['busu'],
    description: '💋 Give someone a kiss (fun)',
    usage: 'kiss [@user]',
    cooldown: 3,
    async run({ resolveTarget, meJid, pool, pick, num, reply }) {
        const t = resolveTarget({ allowNumber: false });
        const target = t ? t.jid : pick(pool);
        if (!target) return reply('❌ Nobody to kiss 😅');
        const me = meJid || target;
        if (num(me) === num(target)) return reply(`💋 @${num(me)} blew a kiss to the mirror 😘`, [me]);
        return reply(`💋 @${num(me)} ${pick(['gave a sweet kiss to', 'blew a kiss to', 'kissed softly'])} @${num(target)} 😘`, [me, target]);
    }
});
