'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'tagrandom',
    emoji: '🎲',
    aliases: ['randomtag', 'pickmembers'],
    description: '🎲 Tag a number of random members (1-30)',
    usage: 'tagrandom [number] [message]',
    cooldown: 8,
    async run({ pool, raw, args, num, pick, send }) {
        const n = Math.min(Math.max(parseInt(args[0], 10) || 3, 1), 30);
        const msg = raw.replace(/^\s*\d+\s*/, '').trim() || 'You were randomly selected! 🎉';
        const chosen = [];
        const copy = [...pool];
        while (chosen.length < n && copy.length) chosen.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
        if (!chosen.length) return send({ text: '❌ No members found 😅' });
        return send({
            text: `🎲 *RANDOM PICK*\n\n${msg}\n\n${chosen.map((j) => `@${num(j)}`).join(' ')}`,
            mentions: chosen
        });
    }
});
