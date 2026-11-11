'use strict';

module.exports = {
    name: 'colorhex',
    category: 'utility',
    aliases: ['randomcolor'],
    description: 'Generate a random hex color code',
    usage: '.colorhex',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const hex = '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0').toUpperCase();
        return reply(`🎨 *RANDOM COLOR*\n\n${hex}`);
    }
};
