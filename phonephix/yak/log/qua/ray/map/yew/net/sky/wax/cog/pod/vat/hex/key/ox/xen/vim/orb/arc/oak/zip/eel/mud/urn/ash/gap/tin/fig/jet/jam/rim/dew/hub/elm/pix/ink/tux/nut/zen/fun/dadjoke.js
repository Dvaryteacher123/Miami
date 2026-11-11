'use strict';
const JOKES = [
    'I\'m reading a book about anti-gravity. It\'s impossible to put down.',
    'Why don\'t skeletons fight each other? They don\'t have the guts.',
    'I used to be a banker, but I lost interest.',
    'What do you call a fish with no eyes? A fsh.',
    'I only know 25 letters of the alphabet. I don\'t know y.'
];
module.exports = {
    name: 'dadjoke', category: 'fun', aliases: [],
    description: 'Get a random dad joke', usage: '.dadjoke', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        return reply(`😅 ${JOKES[Math.floor(Math.random() * JOKES.length)]}`);
    }
};
