'use strict';
module.exports = {
    name: 'removevowels', category: 'utility', aliases: [],
    description: 'Remove all vowels from text', usage: '.removevowels <text>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const text = (args || []).join(' ');
        if (!text) return reply('❌ Usage: .removevowels <text>');
        return reply(text.replace(/[aeiouAEIOU]/g, ''));
    }
};
