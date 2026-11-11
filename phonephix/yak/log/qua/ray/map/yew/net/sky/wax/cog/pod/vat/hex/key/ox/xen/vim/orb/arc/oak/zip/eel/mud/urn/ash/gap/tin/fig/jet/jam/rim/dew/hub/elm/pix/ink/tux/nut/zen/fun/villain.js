'use strict';
const P = ['Dark', 'Lord', 'Doctor', 'The', 'Grim', 'Vile'];
const S = ['Venom', 'Nightmare', 'Ruin', 'Chaos', 'Malice', 'Wraith'];
module.exports = {
    name: 'villain', category: 'fun', aliases: ['villaingen'],
    description: 'Generate a random villain name', usage: '.villain', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const name = `${P[Math.floor(Math.random() * P.length)]} ${S[Math.floor(Math.random() * S.length)]}`;
        return reply(`🦹 Your villain name is: *${name}*`);
    }
};
