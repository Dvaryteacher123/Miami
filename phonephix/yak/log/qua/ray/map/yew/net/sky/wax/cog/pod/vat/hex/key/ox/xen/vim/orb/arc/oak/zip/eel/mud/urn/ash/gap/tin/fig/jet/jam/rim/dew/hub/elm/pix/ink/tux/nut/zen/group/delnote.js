'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'delnote',
    emoji: '🗑️',
    aliases: ['removenote', 'deletenote'],
    description: '🗑️ Delete a saved group note',
    usage: 'delnote <name>',
    admin: true,
    cooldown: 3,
    async run({ store, args, reply, prefix }) {
        const name = String(args[0] || '').toLowerCase().replace(/[^\w\-]/g, '');
        if (!name) return reply(`❌ Enter the note name 🗑️\n\nExample: ${prefix}delnote schedule`);
        const { gs, save } = await store();
        if (!gs.notes || !gs.notes[name]) return reply(`❌ Note *${name}* was not found 🔍`);
        delete gs.notes[name];
        await save();
        return reply(`🗑️ Note *${name}* deleted ✅`);
    }
});
