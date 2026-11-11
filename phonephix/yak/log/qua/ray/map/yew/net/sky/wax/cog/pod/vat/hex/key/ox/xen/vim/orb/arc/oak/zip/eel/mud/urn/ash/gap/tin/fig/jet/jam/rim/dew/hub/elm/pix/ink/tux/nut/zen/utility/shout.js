'use strict';
module.exports = {
    name: 'shout', category: 'utility', aliases: ['yell'],
    description: 'SHOUT your text in caps with emphasis', usage: '.shout <text>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const text = (args || []).join(' ');
        if (!text) return reply('❌ Usage: .shout <text>');
        return reply(`📢 ${text.toUpperCase()}!!!`);
    }
};
