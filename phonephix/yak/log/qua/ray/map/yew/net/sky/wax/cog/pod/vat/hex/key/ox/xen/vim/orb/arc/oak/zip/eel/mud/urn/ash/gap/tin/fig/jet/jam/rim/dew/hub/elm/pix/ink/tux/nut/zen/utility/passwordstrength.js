'use strict';
module.exports = {
    name: 'passwordstrength',
    category: 'utility',
    aliases: ['pwstrength'],
    description: 'Check how strong a password looks (length/variety only, nothing is stored)',
    usage: '.passwordstrength <password>',
    ownerOnly: false,
    cooldown: 5,
    async execute(ctx) {
        const reply = (t) => ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });
        const pw = String(ctx.args?.[0] || '');
        if (!pw) return reply(`❌ Usage: ${ctx.prefix || '.'}passwordstrength <password>`);
        let score = 0;
        if (pw.length >= 8) score++;
        if (pw.length >= 12) score++;
        if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
        if (/\d/.test(pw)) score++;
        if (/[^a-zA-Z0-9]/.test(pw)) score++;
        const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'];
        return reply(`🔒 *PASSWORD STRENGTH*\n\nLength: ${pw.length}\nRating: ${labels[score]}`);
    }
};
