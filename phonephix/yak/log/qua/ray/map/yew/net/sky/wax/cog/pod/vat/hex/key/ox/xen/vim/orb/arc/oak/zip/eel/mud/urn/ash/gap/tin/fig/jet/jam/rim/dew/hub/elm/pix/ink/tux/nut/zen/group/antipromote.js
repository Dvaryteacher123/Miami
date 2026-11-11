'use strict';

const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'antipromote',
    aliases: [],
    description: '🛡️ Undo promotions made by normal admins',
    usage: 'antipromote on/off',
    emoji: '🛡️',
    admin: true,
    botAdmin: true,
    meta: true,
    async run({ args, reply, store, prefix }) {
        const { gs, save } = await store();
        const a = String(args[0] || '').toLowerCase();

        if (a === 'on' || a === 'off') {
            gs.antipromote = a === 'on';
            await save();
            return reply(`🛡️ *ANTIPROMOTE* ${a === 'on' ? '🟢 ON' : '🔴 OFF'}`);
        }
        return reply(`🛡️ *ANTIPROMOTE*\n\nStatus: ${gs.antipromote ? '🟢 ON' : '🔴 OFF'}\n\n• ${prefix}antipromote on\n• ${prefix}antipromote off\n\nUndo promotions made by normal admins. The bot owner is always allowed.`);
    }
});
