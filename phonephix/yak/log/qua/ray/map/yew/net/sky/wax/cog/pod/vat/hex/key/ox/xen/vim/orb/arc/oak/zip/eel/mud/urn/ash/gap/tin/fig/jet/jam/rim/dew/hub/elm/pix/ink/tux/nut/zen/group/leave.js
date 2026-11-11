'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'leave',
    aliases: ['leavegc', 'exitgroup'],
    description: '🚪 Make the bot leave the group (owner only)',
    owner: true,
    meta: false,
    async run({ sock, from, send }) {
        await send({ text: '👋 I am leaving now. Goodbye everyone!' });
        await sock.groupLeave(from);
    }
});
