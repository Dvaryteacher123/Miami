'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'poll',
    aliases: ['kura', 'vote'],
    description: '📊 Create a poll',
    usage: 'poll Question | option1 | option2 | ...',
    meta: false,
    cooldown: 10,
    async run({ sock, from, raw, send, reply, prefix }) {
        const parts = raw.split('|').map((s) => s.trim()).filter(Boolean);
        if (parts.length < 3) {
            return reply(`📊 Usage:\n${prefix}poll Favorite food? | Rice | Chips | Pizza\n\n(A question, then at least 2 options, separated by |)`);
        }
        const [name, ...values] = parts;
        if (values.length > 12) return reply('❌ Maximum 12 options.');
        return send({ poll: { name: name.slice(0, 250), values: values.map((v) => v.slice(0, 100)), selectableCount: 1 } });
    }
});
