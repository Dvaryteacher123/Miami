'use strict';
module.exports = {
    name: 'consonants',
    category: 'utility',
    aliases: [],
    description: 'Count the consonants in a piece of text',
    usage: '.consonants <text>',
    ownerOnly: false,
    cooldown: 5,
    async execute(ctx) {
        const reply = (t) => ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });
        const content = String(ctx.args?.join(' ') || '').trim();
        if (!content) return reply(`❌ Usage: ${ctx.prefix || '.'}consonants <text>`);
        const matches = content.match(/[b-df-hj-np-tv-z]/gi);
        return reply(`🔤 *CONSONANT COUNT*\n\n"${content}"\nConsonants: ${matches ? matches.length : 0}`);
    }
};
