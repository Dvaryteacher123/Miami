'use strict';
const P = ['Nova', 'Flux', 'Byte', 'Peak', 'Loop', 'Vertex'];
const S = ['ly', 'ify', 'io', 'Labs', 'Hub', 'Works'];
module.exports = {
    name: 'startupname', category: 'fun', aliases: [],
    description: 'Generate a random startup name', usage: '.startupname', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const name = `${P[Math.floor(Math.random() * P.length)]}${S[Math.floor(Math.random() * S.length)]}`;
        return reply(`🚀 Your startup name: *${name}*`);
    }
};
