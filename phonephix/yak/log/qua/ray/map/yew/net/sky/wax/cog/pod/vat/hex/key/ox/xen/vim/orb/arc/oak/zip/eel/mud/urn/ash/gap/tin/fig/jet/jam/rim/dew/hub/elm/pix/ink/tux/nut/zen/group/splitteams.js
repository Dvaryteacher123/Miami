'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'splitteams',
    emoji: '⚽',
    aliases: ['teamsplit', 'maketeams'],
    description: '⚽ Split all members into random teams (2-6)',
    usage: 'splitteams [2-6]',
    cooldown: 10,
    async run({ parts, botNums, partId, phoneOf, num, args, reply }) {
        const n = Math.min(Math.max(parseInt(args[0], 10) || 2, 2), 6);
        const people = parts
            .filter((p) => !botNums.includes(num(partId(p))))
            .map((p) => phoneOf(p))
            .filter(Boolean)
            .slice(0, 120);
        if (people.length < n) return reply('❌ Not enough members for that many teams 😅');
        for (let i = people.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [people[i], people[j]] = [people[j], people[i]];
        }
        const teams = Array.from({ length: n }, () => []);
        people.forEach((p, i) => teams[i % n].push(`+${p}`));
        const icons = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠'];
        const out = teams.map((t, i) => `${icons[i]} *Team ${i + 1}* (${t.length})\n${t.join('\n')}`).join('\n\n');
        return reply(`⚽ *RANDOM TEAMS*\n\n${out}\n\n🏆 Good luck everyone!`);
    }
});
