'use strict';
module.exports = {
    name: 'capitalize', category: 'utility', aliases: [],
    description: 'Capitalize the first letter of each sentence', usage: '.capitalize <text>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const text = (args || []).join(' ');
        if (!text) return reply('❌ Usage: .capitalize <text>');
        const out = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
        return reply(out);
    }
};
