'use strict';

const WORDS = ['apple', 'guitar', 'planet', 'jungle', 'wallet', 'rocket', 'candle', 'bridge', 'forest', 'castle'];

module.exports = {
    name: 'scramble',
    category: 'fun',
    aliases: ['unscramble'],
    description: 'Get a scrambled word to guess',
    usage: '.scramble',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const word = WORDS[Math.floor(Math.random() * WORDS.length)];
        const scrambled = word.split('').sort(() => Math.random() - 0.5).join('');

        return reply(`🔤 *WORD SCRAMBLE*\n\nUnscramble this: *${scrambled}*\n\n_Reply .scramble again for a new word._`);
    }
};
