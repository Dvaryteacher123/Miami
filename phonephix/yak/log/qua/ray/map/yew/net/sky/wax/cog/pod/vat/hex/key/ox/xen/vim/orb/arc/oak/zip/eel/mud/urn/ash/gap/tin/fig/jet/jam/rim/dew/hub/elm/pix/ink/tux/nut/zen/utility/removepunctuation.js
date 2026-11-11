'use strict';
module.exports = {
    name: 'removepunctuation',
    category: 'utility',
    aliases: ['nopunct'],
    description: 'Strip punctuation marks out of a text',
    usage: '.removepunctuation <text>',
    ownerOnly: false,
    cooldown: 5,
    async execute(ctx) {
        const reply = (t) => ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });
        const content = String(ctx.args?.join(' ') || '').trim();
        if (!content) return reply(`❌ Usage: ${ctx.prefix || '.'}removepunctuation <text>`);
        const out = content.replace(/[.,/#!$%^&*;:{}=\-_`~()"'?]/g, '');
        return reply(`🧹 *CLEANED TEXT*\n\n${out}`);
    }
};
