'use strict';

module.exports = {
    name: 'wordcount',
    category: 'utility',
    aliases: ['wc'],
    description: 'Count words and characters in text',
    usage: '.wordcount <text>',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const text = (args || []).join(' ');
        if (!text) return reply('❌ Usage: .wordcount <text>');

        const words = text.trim().split(/\s+/).filter(Boolean).length;
        const chars = text.length;
        const charsNoSpace = text.replace(/\s/g, '').length;

        return reply(`📊 *TEXT STATS*\n\nWords: ${words}\nCharacters: ${chars}\nCharacters (no spaces): ${charsNoSpace}`);
    }
};
