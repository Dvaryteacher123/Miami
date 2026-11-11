'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'thankyou',
    emoji: '🙏',
    aliases: ['thanks', 'thankmember'],
    description: '🙏 Thank a member publicly',
    usage: 'thankyou @user [reason]',
    cooldown: 4,
    async run({ resolveTarget, meJid, rest, num, reply, prefix }) {
        const t = resolveTarget({ allowNumber: false });
        if (!t) return reply(`❌ Mention or reply to who you want to thank 🙏\n\nExample: ${prefix}thankyou @user for the help`);
        const by = meJid ? `\n\n💌 From @${num(meJid)}` : '';
        return reply(`🙏 *THANK YOU*\n\n@${num(t.jid)} 💖${rest ? `\n\n✨ ${rest}` : ''}\n\nYou are appreciated!${by}`, [t.jid, meJid].filter(Boolean));
    }
});
