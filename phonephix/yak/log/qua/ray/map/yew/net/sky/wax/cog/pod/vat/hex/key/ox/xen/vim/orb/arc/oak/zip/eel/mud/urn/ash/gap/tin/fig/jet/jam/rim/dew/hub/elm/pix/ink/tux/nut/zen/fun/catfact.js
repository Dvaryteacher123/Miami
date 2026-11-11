'use strict';
const FACTS = [
    'Cats spend 70% of their lives sleeping.',
    'A group of cats is called a clowder.',
    'Cats can\'t taste sweetness.',
    'A cat\'s purr can be a sign of healing, not just happiness.',
    'Cats have five toes on their front paws but only four on the back.'
];
module.exports = {
    name: 'catfact', category: 'fun', aliases: [],
    description: 'Get a random cat fact', usage: '.catfact', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        return reply(`🐱 ${FACTS[Math.floor(Math.random() * FACTS.length)]}`);
    }
};
