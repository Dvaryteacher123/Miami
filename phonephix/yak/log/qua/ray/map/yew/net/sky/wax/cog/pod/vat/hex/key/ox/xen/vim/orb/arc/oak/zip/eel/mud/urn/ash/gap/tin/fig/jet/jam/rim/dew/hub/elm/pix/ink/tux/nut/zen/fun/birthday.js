'use strict';
module.exports = {
    name: 'birthday', category: 'fun', aliases: ['bday'],
    description: 'Get a birthday wish message: .birthday <name>', usage: '.birthday John', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const name = (args || []).join(' ').trim() || 'friend';
        return reply(`🎉🎂 Happy Birthday, ${name}! Wishing you joy, health, and success in the year ahead!`);
    }
};
