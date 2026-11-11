'use strict';
const LINES = [
    'Good night! Rest well and dream big. 🌙',
    'Sweet dreams! Tomorrow is a brand new day. ✨',
    'Good night, sleep tight, and don\'t let the bugs bite. 🌌'
];
module.exports = {
    name: 'goodnight', category: 'fun', aliases: ['gn'],
    description: 'Get a random good night message', usage: '.goodnight', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        return reply(LINES[Math.floor(Math.random() * LINES.length)]);
    }
};
