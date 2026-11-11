'use strict';

const WORDS = ['elephant', 'mountain', 'keyboard', 'sunshine', 'notebook', 'umbrella', 'triangle'];

module.exports = {
    name: 'hangman',
    category: 'fun',
    aliases: [],
    description: 'Get a random hangman word (shown as blanks)',
    usage: '.hangman',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const word = WORDS[Math.floor(Math.random() * WORDS.length)];
        const blanks = word.split('').map(() => '_').join(' ');

        return reply(`🪢 *HANGMAN*\n\n${blanks}\n\n(${word.length} letters) — reply .hangman again for a new word.`);
    }
};
