'use strict';
module.exports = {
    name: 'secretmessage', category: 'fun', aliases: [],
    description: 'Hide text between random symbols for fun', usage: '.secretmessage <text>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const text = (args || []).join(' ');
        if (!text) return reply('❌ Usage: .secretmessage <text>');
        return reply(`🕵️ •°•°•\n\n${text.split('').join('\u200b')}\n\n•°•°•`);
    }
};
