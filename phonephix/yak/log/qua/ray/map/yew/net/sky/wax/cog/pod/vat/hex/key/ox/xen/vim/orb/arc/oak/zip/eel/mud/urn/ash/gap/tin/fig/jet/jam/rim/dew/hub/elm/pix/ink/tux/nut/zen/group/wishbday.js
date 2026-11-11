'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'wishbday',
    emoji: '🎂',
    aliases: ['happybirthday', 'hbd'],
    description: '🎂 Send a birthday wish to a member',
    usage: 'wishbday @user [message]',
    cooldown: 5,
    async run({ resolveTarget, meJid, rest, pick, num, reply, prefix }) {
        const t = resolveTarget({ allowNumber: false });
        if (!t) return reply(`❌ Mention or reply to the birthday star 🎂\n\nExample: ${prefix}wishbday @user`);
        const wish = rest || pick([
            'May your day be filled with joy, laughter and cake! 🍰',
            'Wishing you health, happiness and success this year! 🌟',
            'Another year older, another year better! 🥳',
            'May all your dreams come true this year! 🌈'
        ]);
        const from = meJid ? `\n\nWith love from @${num(meJid)} 💌` : '';
        return reply(`🎂🎉 *HAPPY BIRTHDAY* 🎉🎂\n\n@${num(t.jid)} 🎈\n\n${wish}${from}`, [t.jid, meJid].filter(Boolean));
    }
});
