'use strict';
module.exports = {
    name: 'colorpicker',
    category: 'fun',
    aliases: [],
    description: 'Get a random hex color code',
    usage: '.colorpicker',
    ownerOnly: false,
    cooldown: 5,
    async execute(ctx) {
        const reply = (t) => ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });
        const hex = '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0').toUpperCase();
        return reply(`🎨 *RANDOM COLOR*\n\n${hex}`);
    }
};
