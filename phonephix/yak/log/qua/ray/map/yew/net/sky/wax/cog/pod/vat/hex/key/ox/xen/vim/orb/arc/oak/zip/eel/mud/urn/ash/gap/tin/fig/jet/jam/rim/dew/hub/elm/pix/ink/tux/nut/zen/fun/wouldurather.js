'use strict';

const QUESTIONS = [
    'Would you rather have the ability to fly or be invisible?',
    'Would you rather always be 10 minutes late or 20 minutes early?',
    'Would you rather give up the internet or your car?',
    'Would you rather live without music or without TV/movies?',
    'Would you rather be able to speak every language or talk to animals?'
];

module.exports = {
    name: 'wouldurather',
    category: 'fun',
    aliases: ['wyr'],
    description: 'Get a random "would you rather" question',
    usage: '.wouldurather',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
        return reply(`🤔 *WOULD YOU RATHER*\n\n${q}`);
    }
};
