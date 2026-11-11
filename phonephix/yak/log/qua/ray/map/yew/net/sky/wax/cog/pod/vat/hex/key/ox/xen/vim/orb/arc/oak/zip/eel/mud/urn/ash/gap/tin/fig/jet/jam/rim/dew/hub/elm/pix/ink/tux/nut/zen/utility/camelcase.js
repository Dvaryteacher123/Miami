'use strict';
module.exports = {
    name: 'camelcase', category: 'utility', aliases: [],
    description: 'Convert text to camelCase', usage: '.camelcase <text>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const text = (args || []).join(' ');
        if (!text) return reply('❌ Usage: .camelcase <text>');
        const words = text.toLowerCase().split(/\s+/);
        const out = words[0] + words.slice(1).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
        return reply(out);
    }
};
