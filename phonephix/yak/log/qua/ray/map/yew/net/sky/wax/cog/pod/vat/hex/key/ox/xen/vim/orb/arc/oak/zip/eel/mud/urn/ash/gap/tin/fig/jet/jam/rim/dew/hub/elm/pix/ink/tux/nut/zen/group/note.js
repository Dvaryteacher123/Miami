'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'note',
    emoji: '📖',
    aliases: ['getnote', 'shownote'],
    description: '📖 Show a saved group note',
    usage: 'note <name>',
    cooldown: 3,
    async run({ store, args, reply, prefix }) {
        const name = String(args[0] || '').toLowerCase().replace(/[^\w\-]/g, '');
        if (!name) return reply(`❌ Enter the note name 📖\n\nExample: ${prefix}note schedule\nSee all notes: ${prefix}notes`);
        const { gs } = await store();
        const text = gs.notes && gs.notes[name];
        if (!text) return reply(`❌ Note *${name}* was not found 🔍\n\nSee all notes: ${prefix}notes`);
        return reply(`📖 *${name.toUpperCase()}*\n\n${text}`);
    }
});
