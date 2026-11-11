'use strict';
const LINES = [
    'You bring everyone so much joy... when you leave the room.',
    'I\'d agree with you but then we\'d both be wrong.',
    'You\'re not stupid, you just have bad luck thinking.',
    'You have something on your chin... no, the third one down.',
    'I\'m not saying you\'re slow, but you\'d lose a race to a snail on vacation.'
];
module.exports = {
    name: 'roast', category: 'fun', aliases: [],
    description: 'Get a friendly, light-hearted roast (all in good fun)', usage: '.roast', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        return reply(`🔥 ${LINES[Math.floor(Math.random() * LINES.length)]}`);
    }
};
