'use strict';

const COMPLIMENTS = [
    'You light up every room you walk into! ✨',
    'Your hard work never goes unnoticed. 💪',
    'You have the best laugh! 😄',
    'You make the world a better place just by being in it. 🌍',
    'Your creativity knows no bounds. 🎨',
    'You are stronger than you think. 🦁'
];

module.exports = {
    name: 'compliment',
    category: 'fun',
    aliases: [],
    description: 'Get a random compliment',
    usage: '.compliment [@user]',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const target = (args || []).join(' ').trim();
        const c = COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)];
        return reply(`💖 *COMPLIMENT*${target ? ` for ${target}` : ''}\n\n${c}`);
    }
};
