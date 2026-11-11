'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'teams',
    category: 'fun',
    aliases: [],
    description: 'Split names into random teams',
    usage: 'teams <number of teams> <names>',
    needsInput: true,
    lines: false,
    run: ({ args }) => {
        const n = parseInt(args[0], 10);
        const names = args.slice(1).join(' ').split(/[,\s]+/).filter(Boolean);
        if (!n || n < 2 || n > 10 || names.length < n) throw new Error('Usage: .teams <2-10> <name1 name2 name3 ...> (need at least one name per team)');
        for (let i = names.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [names[i], names[j]] = [names[j], names[i]]; }
        const teams = Array.from({ length: n }, () => []);
        names.forEach((nm, i) => teams[i % n].push(nm));
        return '👥 *RANDOM TEAMS*\n\n' + teams.map((t, i) => `*Team ${i + 1}:* ${t.join(', ')}`).join('\n');
    }
});
