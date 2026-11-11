'use strict';

const CHOICES = ['rock', 'paper', 'scissors'];
const BEATS = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
const EMOJI = { rock: '🪨', paper: '📄', scissors: '✂️' };

module.exports = {
    name: 'rps',
    category: 'fun',
    aliases: ['rockpaperscissors'],
    description: 'Play rock-paper-scissors against the bot',
    usage: '.rps <rock|paper|scissors>',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const choice = (args?.[0] || '').toLowerCase();
        if (!CHOICES.includes(choice)) {
            return reply('❌ Usage: .rps <rock|paper|scissors>');
        }

        const botChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)];
        let result;
        if (choice === botChoice) result = 'It\'s a tie! 🤝';
        else if (BEATS[choice] === botChoice) result = 'You win! 🎉';
        else result = 'I win! 😎';

        return reply(`${EMOJI[choice]} vs ${EMOJI[botChoice]}\n\nYou: ${choice}\nBot: ${botChoice}\n\n${result}`);
    }
};
