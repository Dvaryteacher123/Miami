'use strict';
module.exports = {
    name: 'whisper', category: 'utility', aliases: [],
    description: 'Whisper your text softly in lowercase', usage: '.whisper <text>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const text = (args || []).join(' ');
        if (!text) return reply('❌ Usage: .whisper <text>');
        return reply(`🤫 _${text.toLowerCase()}..._`);
    }
};
