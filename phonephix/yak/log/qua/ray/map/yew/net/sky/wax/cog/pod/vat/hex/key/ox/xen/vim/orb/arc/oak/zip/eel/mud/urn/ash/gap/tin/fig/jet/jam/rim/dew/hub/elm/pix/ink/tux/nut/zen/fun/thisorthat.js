'use strict';
const QUESTIONS = [
    'Tea or Coffee?', 'Beach or Mountains?', 'Morning or Night?',
    'Books or Movies?', 'Sweet or Savory?', 'Cats or Dogs?'
];
module.exports = {
    name: 'thisorthat', category: 'fun', aliases: [],
    description: 'Get a random "this or that" question', usage: '.thisorthat', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        return reply(`⚖️ ${QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]}`);
    }
};
