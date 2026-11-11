'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'notes',
    emoji: '📚',
    aliases: ['listnotes', 'allnotes'],
    description: '📚 List all saved group notes',
    cooldown: 4,
    async run({ store, reply, prefix }) {
        const { gs } = await store();
        const names = Object.keys(gs.notes || {});
        if (!names.length) return reply(`📚 No notes saved yet.\n\nAdmins can use *${prefix}setnote <name> <text>* 🗒️`);
        return reply(`📚 *GROUP NOTES (${names.length})*\n\n${names.map((n) => `🗒️ ${prefix}note ${n}`).join('\n')}`);
    }
});
