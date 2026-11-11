'use strict';
module.exports = {
    name: 'phoneformat',
    category: 'utility',
    aliases: [],
    description: 'Clean and format a phone number (digits + country code check)',
    usage: '.phoneformat <number>',
    ownerOnly: false,
    cooldown: 5,
    async execute(ctx) {
        const reply = (t) => ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });
        const raw = String(ctx.args?.[0] || '').trim();
        if (!raw) return reply(`❌ Usage: ${ctx.prefix || '.'}phoneformat <number>`);
        const digits = raw.replace(/\D/g, '');
        const valid = digits.length >= 8 && digits.length <= 15;
        return reply(`📞 *PHONE FORMAT*\n\nInput: ${raw}\nDigits only: +${digits}\n${valid ? '✅ Valid length' : '❌ Invalid length (needs country code, 8-15 digits)'}`);
    }
};
