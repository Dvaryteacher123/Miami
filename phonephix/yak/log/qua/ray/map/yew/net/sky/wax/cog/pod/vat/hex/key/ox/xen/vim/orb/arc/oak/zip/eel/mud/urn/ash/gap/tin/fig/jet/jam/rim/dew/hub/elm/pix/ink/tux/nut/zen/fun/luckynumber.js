'use strict';
module.exports = {
    name: 'luckynumber', category: 'fun', aliases: [],
    description: 'Get your lucky number of the day', usage: '.luckynumber', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const num = Math.floor(Math.random() * 100) + 1;
        return reply(`🍀 Your lucky number today is ${num}!`);
    }
};
