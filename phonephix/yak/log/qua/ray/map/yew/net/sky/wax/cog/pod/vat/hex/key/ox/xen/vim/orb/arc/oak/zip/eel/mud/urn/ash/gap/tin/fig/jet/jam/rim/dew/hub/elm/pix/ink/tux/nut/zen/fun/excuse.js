'use strict';
const EXCUSES = [
    'My internet was down for exactly the time I needed it.',
    'I was helping a friend move a couch... in another city.',
    'My alarm clock decided to take the day off with me.',
    'I got lost following my GPS in a place I\'ve lived for years.',
    'A family of ducks was crossing the road and I had to wait.'
];
module.exports = {
    name: 'excuse', category: 'fun', aliases: [],
    description: 'Get a random funny excuse', usage: '.excuse', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        return reply(`🙃 ${EXCUSES[Math.floor(Math.random() * EXCUSES.length)]}`);
    }
};
