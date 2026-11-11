'use strict';
const FACTS = [
    'Carrots were originally purple, not orange.',
    'Honey is one of the only foods that never spoils.',
    'Apples float because they are 25% air.',
    'Peanuts are not nuts — they are legumes.',
    'Chocolate was once used as currency by the Aztecs.'
];
module.exports = {
    name: 'foodfact', category: 'fun', aliases: [],
    description: 'Get a random food fact', usage: '.foodfact', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        return reply(`🍽️ ${FACTS[Math.floor(Math.random() * FACTS.length)]}`);
    }
};
