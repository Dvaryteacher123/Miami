'use strict';
module.exports = {
    name: 'readingtime',
    category: 'utility',
    aliases: ['readtime'],
    description: 'Estimate how long it takes to read a piece of text',
    usage: '.readingtime <text>',
    ownerOnly: false,
    cooldown: 5,
    async execute(ctx) {
        const reply = (t) => ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });
        const content = String(ctx.args?.join(' ') || '').trim();
        if (!content) return reply(`❌ Usage: ${ctx.prefix || '.'}readingtime <text>`);
        const words = content.split(/\s+/).filter(Boolean).length;
        const minutes = Math.max(1, Math.ceil(words / 200));
        return reply(`⏱️ *READING TIME*\n\nWords: ${words}\nEstimated time: ~${minutes} min (at 200 wpm)`);
    }
};
