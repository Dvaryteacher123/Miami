'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'blacklisted',
    emoji: '📋',
    aliases: ['blacklistlist', 'banned'],
    description: '📋 Show all blacklisted numbers',
    admin: true,
    cooldown: 5,
    async run({ store, reply }) {
        const { gs } = await store();
        const list = Array.isArray(gs.blacklist) ? gs.blacklist : [];
        if (!list.length) return reply('✅ The blacklist is empty 📋');
        const lines = list.slice(0, 80).map((p, i) => `${i + 1}. ⛔ +${p}`);
        const more = list.length > 80 ? `\n\n…and ${list.length - 80} more` : '';
        return reply(`📋 *BLACKLIST (${list.length})*\n\n${lines.join('\n')}${more}`);
    }
});
