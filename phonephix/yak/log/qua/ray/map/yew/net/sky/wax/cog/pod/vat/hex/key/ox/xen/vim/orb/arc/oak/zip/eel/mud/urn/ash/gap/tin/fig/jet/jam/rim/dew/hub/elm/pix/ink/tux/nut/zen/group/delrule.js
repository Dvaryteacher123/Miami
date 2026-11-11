'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'delrule',
    emoji: '✂️',
    aliases: ['removerule', 'deleterule'],
    description: '✂️ Delete one rule by its number',
    usage: 'delrule <number>',
    admin: true,
    cooldown: 3,
    async run({ store, args, reply, prefix }) {
        const n = parseInt(args[0], 10);
        const { gs, save } = await store();
        const lines = String(gs.rules || '').split('\n').filter((l) => l.trim());
        if (!lines.length) return reply('📜 This group has no rules yet.');
        if (!Number.isInteger(n) || n < 1 || n > lines.length) return reply(`❌ Enter a rule number from 1 to ${lines.length} ✂️\n\nExample: ${prefix}delrule 2`);
        const removed = lines.splice(n - 1, 1)[0];
        let i = 0;
        gs.rules = lines.map((l) => (/^\d+\.\s/.test(l) ? `${++i}. ${l.replace(/^\d+\.\s/, '')}` : l)).join('\n');
        await save();
        return reply(`✂️ Deleted rule:\n_${removed}_\n\nUse *${prefix}rules* to view the updated list 📜`);
    }
});
