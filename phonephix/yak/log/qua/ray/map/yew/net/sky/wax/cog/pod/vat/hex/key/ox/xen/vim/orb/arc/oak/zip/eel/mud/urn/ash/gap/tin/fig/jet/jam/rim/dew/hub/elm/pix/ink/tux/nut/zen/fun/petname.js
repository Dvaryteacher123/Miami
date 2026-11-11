'use strict';
const NAMES = ['Biscuit', 'Mochi', 'Nugget', 'Peanut', 'Waffles', 'Pepper', 'Cocoa', 'Bubbles'];
module.exports = {
    name: 'petname', category: 'fun', aliases: [],
    description: 'Generate a random pet name', usage: '.petname', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        return reply(`🐾 ${NAMES[Math.floor(Math.random() * NAMES.length)]}`);
    }
};
