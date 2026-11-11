'use strict';
module.exports = {
    name: 'syllablecount',
    category: 'utility',
    aliases: ['syllables'],
    description: 'Roughly estimate the number of syllables in a word or phrase',
    usage: '.syllablecount <text>',
    ownerOnly: false,
    cooldown: 5,
    async execute(ctx) {
        const reply = (t) => ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });
        const content = String(ctx.args?.join(' ') || '').trim();
        if (!content) return reply(`❌ Usage: ${ctx.prefix || '.'}syllablecount <text>`);
        const words = content.toLowerCase().split(/\s+/);
        let total = 0;
        for (const w of words) {
            const matches = w.replace(/e$/, '').match(/[aeiouy]+/g);
            total += matches ? matches.length : 1;
        }
        return reply(`🔤 *ESTIMATED SYLLABLES*\n\n"${content}" ≈ ${total}`);
    }
};
