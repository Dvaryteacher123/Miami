'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

const ROASTS = [
    'has been "typing..." for 3 hours and sent nothing 😴',
    'replies to messages from last week like breaking news 📰',
    'has the confidence of a person who never checks their battery 🔋',
    'reads every message and answers none of them 👀',
    'still says "I am on my way" while lying in bed 🛏️',
    'sends "Hi" and disappears for 3 days 👋',
    'has more unread chats than a post office 📬',
    'is always "almost there" 🚗'
];
module.exports = defineGroup({
    name: 'roastmember',
    emoji: '🔥',
    aliases: ['roastgc', 'burn'],
    description: '🔥 Friendly roast of a member (all in good fun)',
    usage: 'roastmember [@user]',
    cooldown: 4,
    async run({ resolveTarget, pool, pick, num, reply }) {
        const t = resolveTarget({ allowNumber: false });
        const target = t ? t.jid : pick(pool);
        if (!target) return reply('❌ Nobody to roast 😅');
        return reply(`🔥 *FRIENDLY ROAST*\n\n@${num(target)} ${pick(ROASTS)}\n\n_Love you though!_ ❤️😂`, [target]);
    }
});
