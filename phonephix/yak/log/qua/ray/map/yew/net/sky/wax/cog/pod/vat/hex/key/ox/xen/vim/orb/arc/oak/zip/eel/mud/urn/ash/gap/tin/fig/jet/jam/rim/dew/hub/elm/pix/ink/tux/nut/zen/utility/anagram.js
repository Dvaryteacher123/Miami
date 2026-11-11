'use strict';

module.exports = {
    name: 'anagram',
    category: 'utility',
    aliases: [],
    description: 'Check if two words are anagrams: .anagram word1 word2',
    usage: '.anagram <word1> <word2>',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const [a, b] = args || [];
        if (!a || !b) return reply('❌ Usage: .anagram <word1> <word2>');

        const norm = (s) => s.toLowerCase().split('').sort().join('');
        const isAnagram = norm(a) === norm(b);

        return reply(isAnagram
            ? `✅ "${a}" and "${b}" are anagrams!`
            : `❌ "${a}" and "${b}" are not anagrams.`);
    }
};
