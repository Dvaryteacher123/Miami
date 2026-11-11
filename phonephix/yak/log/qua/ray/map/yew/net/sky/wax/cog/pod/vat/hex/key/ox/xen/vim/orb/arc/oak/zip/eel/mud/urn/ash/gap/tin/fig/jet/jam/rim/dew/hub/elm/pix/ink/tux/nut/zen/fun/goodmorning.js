'use strict';
const LINES = [
    'Good morning! Wishing you a day as bright as your smile. ☀️',
    'Rise and shine! Today is full of new opportunities. 🌅',
    'Good morning! May your coffee be strong and your day be productive. ☕'
];
module.exports = {
    name: 'goodmorning', category: 'fun', aliases: ['gm'],
    description: 'Get a random good morning message', usage: '.goodmorning', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        return reply(LINES[Math.floor(Math.random() * LINES.length)]);
    }
};
