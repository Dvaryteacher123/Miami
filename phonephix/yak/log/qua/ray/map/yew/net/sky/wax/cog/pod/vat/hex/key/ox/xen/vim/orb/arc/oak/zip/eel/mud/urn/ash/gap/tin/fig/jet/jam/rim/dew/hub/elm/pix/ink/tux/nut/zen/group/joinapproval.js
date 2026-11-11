'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'joinapproval',
    aliases: ['approvalmode', 'gcapproval'],
    description: '🛂 Require admin approval before people can join (on/off)',
    usage: 'joinapproval on|off',
    admin: true,
    botAdmin: true,
    async run({ sock, from, args, reply, prefix }) {
        const opt = String(args[0] || '').toLowerCase();
        if (!['on', 'off'].includes(opt)) return reply(`🛂 Usage:\n${prefix}joinapproval on\n${prefix}joinapproval off`);
        await sock.groupJoinApprovalMode(from, opt);
        return reply(opt === 'on' ? '✅ New joiners now *wait for admin approval*.' : '✅ Join approval *turned off*.');
    }
});
