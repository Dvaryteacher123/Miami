'use strict';
module.exports = {
    name: 'reversewords',
    category: 'utility',
    aliases: [],
    description: 'Reverse the order of words in a sentence (keeps each word intact)',
    usage: '.reversewords <sentence>',
    ownerOnly: false,
    cooldown: 5,
    async execute(ctx) {
        const reply = (t) => ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });
        const content = String(ctx.args?.join(' ') || '').trim();
        if (!content) return reply(`❌ Usage: ${ctx.prefix || '.'}reversewords <sentence>`);
        return reply(`🔁 *REVERSED WORD ORDER*\n\n${content.split(/\s+/).reverse().join(' ')}`);
    }
};
