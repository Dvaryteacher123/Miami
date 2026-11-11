'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

const LINES = [
    'is an absolute legend! 🏆',
    'brings great energy to this group! ⚡',
    'is one of the kindest people here! 💖',
    'is smarter than they let on! 🧠',
    'always makes the chat better! 🌈',
    'deserves a medal today! 🥇',
    'is a true MVP! 🌟',
    'has the best vibes! ✨'
];
module.exports = defineGroup({
    name: 'praise',
    emoji: '🌟',
    aliases: ['applaud', 'hype'],
    description: '🌟 Praise a member (mention, reply, or random)',
    usage: 'praise [@user]',
    cooldown: 3,
    async run({ resolveTarget, pool, pick, num, reply }) {
        const t = resolveTarget({ allowNumber: false });
        const target = t ? t.jid : pick(pool);
        if (!target) return reply('❌ Nobody to praise 😅');
        return reply(`🌟 *PRAISE*\n\n@${num(target)} ${pick(LINES)}`, [target]);
    }
});
