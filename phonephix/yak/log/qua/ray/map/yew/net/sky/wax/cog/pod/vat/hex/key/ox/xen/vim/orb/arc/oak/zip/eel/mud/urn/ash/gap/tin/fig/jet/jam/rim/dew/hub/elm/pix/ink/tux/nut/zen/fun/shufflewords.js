'use strict';
module.exports = {
    name: 'shufflewords',
    category: 'fun',
    aliases: [],
    description: 'Shuffle the order of words in a sentence',
    usage: '.shufflewords <sentence>',
    ownerOnly: false,
    cooldown: 5,
    async execute(ctx) {
        const reply = (t) => ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });
        const content = String(ctx.args?.join(' ') || '').trim();
        if (!content) return reply(`❌ Usage: ${ctx.prefix || '.'}shufflewords <sentence>`);
        const words = content.split(/\s+/);
        for (let i = words.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [words[i], words[j]] = [words[j], words[i]];
        }
        return reply(`🔀 *SHUFFLED*\n\n${words.join(' ')}`);
    }
};
