'use strict';
const P = ['Captain', 'Doctor', 'The', 'Mega', 'Ultra', 'Iron'];
const S = ['Blaze', 'Thunder', 'Shadow', 'Bolt', 'Titan', 'Phantom'];
module.exports = {
    name: 'superhero', category: 'fun', aliases: ['herogen'],
    description: 'Generate a random superhero name', usage: '.superhero', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const name = `${P[Math.floor(Math.random() * P.length)]} ${S[Math.floor(Math.random() * S.length)]}`;
        return reply(`🦸 Your superhero name is: *${name}*`);
    }
};
