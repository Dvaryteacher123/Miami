'use strict';

const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'antidemote',
    aliases: [],
    description: '🛡️ Undo demotions made by normal admins',
    usage: 'antidemote on/off',
    emoji: '🛡️',
    admin: true,
    botAdmin: true,
    meta: true,
    async run({ args, reply, store, prefix }) {
        const { gs, save } = await store();
        const a = String(args[0] || '').toLowerCase();

        if (a === 'on' || a === 'off') {
            gs.antidemote = a === 'on';
            await save();
            return reply(`🛡️ *ANTIDEMOTE* ${a === 'on' ? '🟢 ON' : '🔴 OFF'}`);
        }
        return reply(`🛡️ *ANTIDEMOTE*\n\nStatus: ${gs.antidemote ? '🟢 ON' : '🔴 OFF'}\n\n• ${prefix}antidemote on\n• ${prefix}antidemote off\n\nUndo demotions made by normal admins. The bot owner is always allowed.`);
    }
});
