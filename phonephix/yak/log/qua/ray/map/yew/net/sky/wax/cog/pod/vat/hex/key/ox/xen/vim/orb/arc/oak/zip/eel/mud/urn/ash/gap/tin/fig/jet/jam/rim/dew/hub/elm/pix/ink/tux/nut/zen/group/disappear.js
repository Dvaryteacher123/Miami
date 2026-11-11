'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

const MAP = { off: 0, '24h': 86400, '7d': 604800, '90d': 7776000 };

module.exports = defineGroup({
    name: 'disappear',
    aliases: ['ephemeral', 'disappearing'],
    description: '⏳ Turn disappearing messages on/off (off, 24h, 7d, 90d)',
    usage: 'disappear off|24h|7d|90d',
    admin: true,
    botAdmin: true,
    async run({ sock, from, args, reply, prefix }) {
        const opt = String(args[0] || '').toLowerCase();
        if (!(opt in MAP)) {
            return reply(`⏳ *DISAPPEARING MESSAGES*\n\n${prefix}disappear off\n${prefix}disappear 24h\n${prefix}disappear 7d\n${prefix}disappear 90d`);
        }
        await sock.groupToggleEphemeral(from, MAP[opt]);
        return reply(opt === 'off' ? '✅ Disappearing messages *turned off*.' : `✅ Messages will now disappear after *${opt}*.`);
    }
});
