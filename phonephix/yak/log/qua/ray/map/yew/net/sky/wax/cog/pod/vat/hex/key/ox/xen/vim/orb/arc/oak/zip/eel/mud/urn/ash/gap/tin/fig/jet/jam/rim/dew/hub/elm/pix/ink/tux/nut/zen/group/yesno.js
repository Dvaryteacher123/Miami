'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'yesno',
    emoji: '👍',
    aliases: ['yn', 'quickpoll'],
    description: '👍 Quick Yes / No / Not sure poll',
    usage: 'yesno <question>',
    meta: false,
    cooldown: 8,
    async run({ raw, send, reply, prefix }) {
        if (!raw) return reply(`❌ Ask a question 👍\n\nExample: ${prefix}yesno Should we meet on Friday?`);
        return send({ poll: { name: `👍 ${raw.slice(0, 240)}`, values: ['✅ Yes', '❌ No', '🤷 Not sure'], selectableCount: 1 } });
    }
});
