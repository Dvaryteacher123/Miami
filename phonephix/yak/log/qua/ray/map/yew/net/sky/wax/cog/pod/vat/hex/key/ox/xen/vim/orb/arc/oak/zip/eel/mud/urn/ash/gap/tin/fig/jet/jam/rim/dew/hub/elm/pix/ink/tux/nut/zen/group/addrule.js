'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'addrule',
    emoji: '📌',
    aliases: ['newrule', 'appendrule'],
    description: '📌 Add one rule to the group rules',
    usage: 'addrule <rule>',
    admin: true,
    cooldown: 3,
    async run({ store, raw, reply, prefix }) {
        if (!raw) return reply(`❌ Write the rule 📌\n\nExample: ${prefix}addrule No spam or advertising`);
        const { gs, save } = await store();
        const lines = String(gs.rules || '').split('\n').filter((l) => l.trim());
        if (lines.length >= 40) return reply('❌ Too many rules (max 40) 📜');
        lines.push(`${lines.length + 1}. ${raw.replace(/\s+/g, ' ').slice(0, 300)}`);
        gs.rules = lines.join('\n').slice(0, 3000);
        await save();
        return reply(`📌 Rule *#${lines.length}* added ✅\n\nUse *${prefix}rules* to view all.`);
    }
});
