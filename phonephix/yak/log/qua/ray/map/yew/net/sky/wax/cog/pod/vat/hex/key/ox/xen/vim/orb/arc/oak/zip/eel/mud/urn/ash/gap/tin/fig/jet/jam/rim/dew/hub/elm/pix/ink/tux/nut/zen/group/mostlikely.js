'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'mostlikely',
    emoji: '🤔',
    aliases: ['wholikely', 'whowill'],
    description: '🤔 Who is most likely to...? The bot picks a member',
    usage: 'mostlikely <something>',
    cooldown: 4,
    async run({ pool, pick, num, raw, reply, prefix }) {
        if (!raw) return reply(`❌ Finish the sentence 🤔\n\nExample: ${prefix}mostlikely become a millionaire`);
        const target = pick(pool);
        if (!target) return reply('❌ No members found 😅');
        return reply(`🤔 *MOST LIKELY TO...*\n\n_${raw.slice(0, 200)}_\n\n👉 @${num(target)} 😂🎉`, [target]);
    }
});
