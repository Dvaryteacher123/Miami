'use strict';
module.exports = {
    name: 'iqtest', category: 'fun', aliases: ['iq'],
    description: 'Fun random IQ score generator (just for laughs)', usage: '.iqtest', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const iq = 85 + Math.floor(Math.random() * 60);
        return reply(`🧠 Your fun IQ score: ${iq} (just for entertainment!)`);
    }
};
