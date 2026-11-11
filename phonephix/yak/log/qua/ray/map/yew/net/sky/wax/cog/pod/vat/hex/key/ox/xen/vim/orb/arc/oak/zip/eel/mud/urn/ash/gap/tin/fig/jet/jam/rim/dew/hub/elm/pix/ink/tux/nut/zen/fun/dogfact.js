'use strict';
const FACTS = [
    'Dogs have about 300 million scent receptors, compared to a human\'s 6 million.',
    'A dog\'s nose print is as unique as a human fingerprint.',
    'Puppies are born deaf and blind.',
    'Dogs can learn more than 100 words and gestures.',
    'The Basenji is known as the "barkless dog".'
];
module.exports = {
    name: 'dogfact', category: 'fun', aliases: [],
    description: 'Get a random dog fact', usage: '.dogfact', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        return reply(`🐶 ${FACTS[Math.floor(Math.random() * FACTS.length)]}`);
    }
};
