'use strict';
module.exports = {
    name: 'urlcheck',
    category: 'utility',
    aliases: ['validurl'],
    description: 'Check whether text looks like a valid URL format',
    usage: '.urlcheck <url>',
    ownerOnly: false,
    cooldown: 5,
    async execute(ctx) {
        const reply = (t) => ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });
        const url = String(ctx.args?.[0] || '').trim();
        if (!url) return reply(`❌ Usage: ${ctx.prefix || '.'}urlcheck <url>`);
        let ok = false;
        try { new URL(url); ok = true; } catch (_) { ok = false; }
        return reply(`🔗 *URL FORMAT CHECK*\n\n${url}\n${ok ? '✅ Looks valid' : '❌ Not a valid URL'}`);
    }
};
