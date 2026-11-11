'use strict';
module.exports = {
    name: 'sentencecount', category: 'utility', aliases: [],
    description: 'Count the number of sentences in text', usage: '.sentencecount <text>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const text = (args || []).join(' ');
        if (!text) return reply('❌ Usage: .sentencecount <text>');
        const count = (text.match(/[.!?]+(?=\s|$)/g) || []).length || 1;
        return reply(`📊 Sentences: ${count}`);
    }
};
