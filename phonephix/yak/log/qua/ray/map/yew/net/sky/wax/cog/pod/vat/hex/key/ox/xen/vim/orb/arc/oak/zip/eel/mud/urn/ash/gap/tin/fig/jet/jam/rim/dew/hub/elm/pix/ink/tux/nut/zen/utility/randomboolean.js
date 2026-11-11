'use strict';
module.exports = {
    name: 'yesorno', category: 'fun', aliases: ['randomyn'],
    description: 'Get a random yes or no answer', usage: '.yesorno', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        return reply(Math.random() < 0.5 ? '✅ Yes' : '❌ No');
    }
};
