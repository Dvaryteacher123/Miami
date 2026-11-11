'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'vibecheck',
    emoji: '✨',
    aliases: ['vibe', 'vibes'],
    description: '✨ Check someone\'s vibe level',
    usage: 'vibecheck [@user]',
    cooldown: 4,
    async run({ resolveTarget, meJid, pick, num, reply }) {
        const t = resolveTarget({ allowNumber: false });
        const target = t ? t.jid : meJid;
        if (!target) return reply('❌ Could not find that member 😅');
        const pct = Math.floor(Math.random() * 101);
        const mood = pct >= 85 ? 'Immaculate vibes! 😎🔥' : pct >= 60 ? 'Good vibes only ✌️' : pct >= 35 ? 'Mid... but we love you 😅' : 'Needs a coffee ☕😴';
        const bar = '🟩'.repeat(Math.round(pct / 10)) + '⬜'.repeat(10 - Math.round(pct / 10));
        return reply(`✨ *VIBE CHECK*\n\n@${num(target)}\n${bar}\n*${pct}%* — ${mood}`, [target]);
    }
});
