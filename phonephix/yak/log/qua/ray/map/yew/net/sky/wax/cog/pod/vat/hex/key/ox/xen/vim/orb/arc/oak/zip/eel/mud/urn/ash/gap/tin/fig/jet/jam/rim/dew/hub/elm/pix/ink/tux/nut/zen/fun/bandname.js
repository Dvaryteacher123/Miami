'use strict';
const P = ['Electric', 'Velvet', 'Midnight', 'Crimson', 'Broken', 'Neon'];
const S = ['Foxes', 'Echoes', 'Riot', 'Owls', 'Static', 'Wolves'];
module.exports = {
    name: 'bandname', category: 'fun', aliases: [],
    description: 'Generate a random band name', usage: '.bandname', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const name = `${P[Math.floor(Math.random() * P.length)]} ${S[Math.floor(Math.random() * S.length)]}`;
        return reply(`🎸 Your band name: *${name}*`);
    }
};
