'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'addmode',
    aliases: ['whocanadd'],
    description: '➕ Choose who can add members: admins only or everyone',
    usage: 'addmode admin|all',
    admin: true,
    botAdmin: true,
    async run({ sock, from, args, reply, prefix }) {
        const opt = String(args[0] || '').toLowerCase();
        if (!['admin', 'all'].includes(opt)) return reply(`➕ Usage:\n${prefix}addmode admin\n${prefix}addmode all`);
        await sock.groupMemberAddMode(from, opt === 'admin' ? 'admin_add' : 'all_member_add');
        return reply(opt === 'admin' ? '✅ Only *admins* can add members now.' : '✅ *All members* can add members now.');
    }
});
