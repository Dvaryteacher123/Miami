'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'setnote',
    emoji: '🗒️',
    aliases: ['addnote', 'savenote'],
    description: '🗒️ Save a note for the group (view with .note <name>)',
    usage: 'setnote <name> <text>',
    admin: true,
    cooldown: 3,
    async run({ store, raw, reply, prefix }) {
        const m = raw.match(/^(\S+)\s+([\s\S]+)$/);
        if (!m) return reply(`❌ Give a name and the note text 🗒️\n\nExample: ${prefix}setnote schedule Class starts at 9am`);
        const name = m[1].toLowerCase().replace(/[^\w\-]/g, '').slice(0, 30);
        if (!name) return reply('❌ The note name must use letters or numbers 🗒️');
        const { gs, save } = await store();
        if (!gs.notes || typeof gs.notes !== 'object') gs.notes = {};
        if (!gs.notes[name] && Object.keys(gs.notes).length >= 50) return reply('❌ Note limit reached (50). Delete one first 🗑️');
        gs.notes[name] = m[2].slice(0, 1500);
        await save();
        return reply(`🗒️ Note *${name}* saved ✅\n\nView it with *${prefix}note ${name}*`);
    }
});
