'use strict';

module.exports = {
    name: 'bigtext',
    category: 'utility',
    aliases: ['spaced'],
    description: 'Spread out text with spaces for emphasis',
    usage: '.bigtext <text>',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const text = (args || []).join(' ');
        if (!text) return reply('❌ Usage: .bigtext <text>');

        return reply(text.toUpperCase().split('').join(' '));
    }
};
