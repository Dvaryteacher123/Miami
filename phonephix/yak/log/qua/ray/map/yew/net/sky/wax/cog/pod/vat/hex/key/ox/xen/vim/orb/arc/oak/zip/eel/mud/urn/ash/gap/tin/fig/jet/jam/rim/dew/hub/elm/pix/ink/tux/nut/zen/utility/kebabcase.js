'use strict';
module.exports = {
    name: 'kebabcase', category: 'utility', aliases: [],
    description: 'Convert text to kebab-case', usage: '.kebabcase <text>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const text = (args || []).join(' ');
        if (!text) return reply('❌ Usage: .kebabcase <text>');
        return reply(text.toLowerCase().trim().replace(/\s+/g, '-'));
    }
};
