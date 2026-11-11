'use strict';

const http = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/http');

module.exports = {
    name: 'bible',
    category: 'utility',
    aliases: ['verse', 'biblia'],
    description: 'Read a Bible verse (e.g. .bible John 3:16)',
    usage: '.bible <book chapter:verse>',
    emoji: '✝️',
    cooldown: 4,

    async execute(ctx) {
        const ref = (ctx.args || []).join(' ').trim();
        if (!ref) return ctx.reply(`❌ Usage: ${ctx.prefix || '.'}bible John 3:16\n${ctx.prefix || '.'}bible Psalm 23:1-6`);

        const d = await http.get(`https://bible-api.com/${encodeURIComponent(ref)}?translation=kjv`);
        if (!d || !d.text) return ctx.reply('❌ Verse not found.');
        return ctx.reply(`✝️ *${d.reference}* (${d.translation_name || 'KJV'})\n\n${String(d.text).trim().slice(0, 1800)}`);
    }
};
