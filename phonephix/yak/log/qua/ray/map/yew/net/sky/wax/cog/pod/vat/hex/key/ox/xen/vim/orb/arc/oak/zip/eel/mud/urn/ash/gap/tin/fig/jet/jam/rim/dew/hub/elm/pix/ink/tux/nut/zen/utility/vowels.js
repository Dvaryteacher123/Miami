'use strict';

module.exports = {
    name: 'vowels',
    category: 'utility',
    aliases: ['countvowels'],
    description: 'Count vowels and consonants in text',
    usage: '.vowels <text>',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const text = (args || []).join(' ');
        if (!text) return reply('❌ Usage: .vowels <text>');

        const letters = text.toLowerCase().match(/[a-z]/g) || [];
        const vowels = letters.filter((c) => 'aeiou'.includes(c)).length;
        const consonants = letters.length - vowels;

        return reply(`🔤 *LETTER COUNT*\n\nVowels: ${vowels}\nConsonants: ${consonants}`);
    }
};
