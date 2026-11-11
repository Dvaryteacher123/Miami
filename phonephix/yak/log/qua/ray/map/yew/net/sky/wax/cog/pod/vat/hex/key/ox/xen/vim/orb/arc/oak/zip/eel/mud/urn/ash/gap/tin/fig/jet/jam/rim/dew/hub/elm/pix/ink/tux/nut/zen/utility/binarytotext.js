'use strict';
module.exports = {
    name: 'binarytotext',
    category: 'utility',
    aliases: ['bin2text'],
    description: 'Convert binary code back into readable text',
    usage: '.binarytotext <binary>',
    ownerOnly: false,
    cooldown: 5,
    async execute(ctx) {
        const reply = (t) => ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });
        const content = String(ctx.args?.join(' ') || '').trim();
        if (!content) return reply(`❌ Usage: ${ctx.prefix || '.'}binarytotext <binary>`);
        try {
            const text = content.split(/\s+/).map(b => String.fromCharCode(parseInt(b, 2))).join('');
            if (/[\uFFFD]|NaN/.test(text)) throw new Error('invalid');
            return reply(`🔤 *BINARY → TEXT*\n\n${text}`);
        } catch (_) {
            return reply('❌ Invalid binary input. Separate each byte with a space, e.g. 01001000 01101001');
        }
    }
};
