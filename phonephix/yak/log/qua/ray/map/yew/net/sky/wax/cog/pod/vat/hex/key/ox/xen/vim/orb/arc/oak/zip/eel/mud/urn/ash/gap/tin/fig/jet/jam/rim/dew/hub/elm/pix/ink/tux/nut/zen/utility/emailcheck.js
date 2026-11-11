'use strict';
module.exports = {
    name: 'emailcheck',
    category: 'utility',
    aliases: ['validemail'],
    description: 'Check whether text looks like a valid email address format',
    usage: '.emailcheck <email>',
    ownerOnly: false,
    cooldown: 5,
    async execute(ctx) {
        const reply = (t) => ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });
        const email = String(ctx.args?.[0] || '').trim();
        if (!email) return reply(`❌ Usage: ${ctx.prefix || '.'}emailcheck <email>`);
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        return reply(`📧 *EMAIL FORMAT CHECK*\n\n${email}\n${ok ? '✅ Looks valid' : '❌ Not a valid format'}`);
    }
};
