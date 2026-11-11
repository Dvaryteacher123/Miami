'use strict';
module.exports = {
    name: 'slugify', category: 'utility', aliases: ['slug'],
    description: 'Convert text into a URL-friendly slug', usage: '.slugify <text>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const text = (args || []).join(' ');
        if (!text) return reply('❌ Usage: .slugify <text>');
        const out = text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return reply(`🔗 ${out}`);
    }
};
