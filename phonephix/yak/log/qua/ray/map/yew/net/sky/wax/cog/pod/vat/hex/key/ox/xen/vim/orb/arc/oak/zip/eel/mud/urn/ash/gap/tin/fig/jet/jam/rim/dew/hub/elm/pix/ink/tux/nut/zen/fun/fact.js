'use strict';

const FACTS = [
    'Honey never spoils — archaeologists have found 3000-year-old honey that\'s still edible.',
    'Octopuses have three hearts and blue blood.',
    'Bananas are berries, but strawberries aren\'t.',
    'A day on Venus is longer than a year on Venus.',
    'Sharks existed before trees.',
    'The Eiffel Tower can grow taller in summer due to heat expansion.',
    'A group of flamingos is called a "flamboyance".',
    'Wombat poop is cube-shaped.'
];

module.exports = {
    name: 'fact',
    category: 'fun',
    aliases: ['didyouknow'],
    description: 'Get a random fun fact',
    usage: '.fact',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const f = FACTS[Math.floor(Math.random() * FACTS.length)];
        return reply(`🧠 *DID YOU KNOW?*\n\n${f}`);
    }
};
