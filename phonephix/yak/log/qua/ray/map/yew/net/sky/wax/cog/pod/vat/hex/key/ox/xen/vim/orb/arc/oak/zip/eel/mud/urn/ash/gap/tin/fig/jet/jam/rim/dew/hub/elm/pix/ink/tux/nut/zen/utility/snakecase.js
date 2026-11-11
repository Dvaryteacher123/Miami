'use strict';
module.exports = {
    name: 'snakecase', category: 'utility', aliases: [],
    description: 'Convert text to snake_case', usage: '.snakecase <text>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const text = (args || []).join(' ');
        if (!text) return reply('❌ Usage: .snakecase <text>');
        return reply(text.toLowerCase().trim().replace(/\s+/g, '_'));
    }
};
