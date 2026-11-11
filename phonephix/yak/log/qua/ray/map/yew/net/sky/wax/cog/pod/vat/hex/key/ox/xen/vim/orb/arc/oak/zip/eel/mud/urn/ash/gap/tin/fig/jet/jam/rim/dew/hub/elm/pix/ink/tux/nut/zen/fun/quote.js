'use strict';

const QUOTES = [
    '"The only way to do great work is to love what you do." — Steve Jobs',
    '"Life is what happens when you\'re busy making other plans." — John Lennon',
    '"In the middle of every difficulty lies opportunity." — Albert Einstein',
    '"Success is not final, failure is not fatal." — Winston Churchill',
    '"The future belongs to those who believe in the beauty of their dreams." — Eleanor Roosevelt',
    '"It always seems impossible until it\'s done." — Nelson Mandela',
    '"Do what you can, with what you have, where you are." — Theodore Roosevelt'
];

module.exports = {
    name: 'quote',
    category: 'fun',
    aliases: ['inspire'],
    description: 'Get a random inspirational quote',
    usage: '.quote',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        return reply(`💬 *QUOTE*\n\n${q}`);
    }
};
