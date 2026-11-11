'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'congrats',
    emoji: '🎉',
    aliases: ['congratulate', 'welldone'],
    description: '🎉 Congratulate a member',
    usage: 'congrats @user [reason]',
    cooldown: 4,
    async run({ resolveTarget, rest, num, reply, prefix }) {
        const t = resolveTarget({ allowNumber: false });
        if (!t) return reply(`❌ Mention or reply to who you want to congratulate 🎉\n\nExample: ${prefix}congrats @user passing exams`);
        return reply(`🎉🎊 *CONGRATULATIONS* 🎊🎉\n\n@${num(t.jid)} 👏${rest ? `\n\n🏆 ${rest}` : ''}\n\nWe are so proud of you! 💪🥳`, [t.jid]);
    }
});
