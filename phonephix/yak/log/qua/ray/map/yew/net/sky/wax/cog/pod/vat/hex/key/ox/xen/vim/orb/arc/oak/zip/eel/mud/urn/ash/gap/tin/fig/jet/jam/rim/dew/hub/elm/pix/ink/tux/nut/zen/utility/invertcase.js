'use strict';
module.exports = {
    name: 'invertcase',
    category: 'utility',
    aliases: ['togglecase'],
    description: 'Flip the case of every letter in a text',
    usage: '.invertcase <text>',
    ownerOnly: false,
    cooldown: 5,
    async execute(ctx) {
        const reply = (t) => ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });
        const content = String(ctx.args?.join(' ') || '').trim();
        if (!content) return reply(`❌ Usage: ${ctx.prefix || '.'}invertcase <text>`);
        const out = content.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('');
        return reply(`🔤 *INVERTED CASE*\n\n${out}`);
    }
};
