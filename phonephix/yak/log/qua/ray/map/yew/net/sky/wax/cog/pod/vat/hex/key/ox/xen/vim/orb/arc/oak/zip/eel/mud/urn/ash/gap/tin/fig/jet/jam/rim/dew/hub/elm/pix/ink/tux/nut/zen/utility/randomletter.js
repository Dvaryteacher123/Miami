'use strict';
module.exports = {
    name: 'randomletter', category: 'utility', aliases: [],
    description: 'Get a random letter of the alphabet', usage: '.randomletter', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        return reply(`🔤 ${letters[Math.floor(Math.random() * letters.length)]}`);
    }
};
