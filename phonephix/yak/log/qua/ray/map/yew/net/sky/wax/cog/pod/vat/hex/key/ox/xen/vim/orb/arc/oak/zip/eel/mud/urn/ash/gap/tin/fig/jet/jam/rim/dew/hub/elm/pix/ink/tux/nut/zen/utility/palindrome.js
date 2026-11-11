'use strict';

module.exports = {
    name: 'palindrome',
    category: 'utility',
    aliases: [],
    description: 'Check if text is a palindrome',
    usage: '.palindrome <text>',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const raw = (args || []).join(' ');
        if (!raw) return reply('❌ Usage: .palindrome <text>');

        const clean = raw.toLowerCase().replace(/[^a-z0-9]/g, '');
        const isPalindrome = clean === clean.split('').reverse().join('');

        return reply(isPalindrome
            ? `✅ "${raw}" is a palindrome!`
            : `❌ "${raw}" is not a palindrome.`);
    }
};
