'use strict';

const TRIVIA = [
    { q: 'What is the capital of Tanzania?', a: 'Dodoma' },
    { q: 'How many continents are there?', a: '7' },
    { q: 'What is the largest planet in our solar system?', a: 'Jupiter' },
    { q: 'What language has the most native speakers in the world?', a: 'Mandarin Chinese' },
    { q: 'What year did WWII end?', a: '1945' }
];

module.exports = {
    name: 'trivia',
    category: 'fun',
    aliases: [],
    description: 'Get a random trivia question',
    usage: '.trivia',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const t = TRIVIA[Math.floor(Math.random() * TRIVIA.length)];
        return reply(`❓ *TRIVIA*\n\n${t.q}\n\n_Answer: ${t.a}_`);
    }
};
