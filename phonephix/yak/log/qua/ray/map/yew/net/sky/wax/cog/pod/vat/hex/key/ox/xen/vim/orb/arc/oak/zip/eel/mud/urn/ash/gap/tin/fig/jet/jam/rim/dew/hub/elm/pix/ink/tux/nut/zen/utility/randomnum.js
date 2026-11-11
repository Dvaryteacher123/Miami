'use strict';

module.exports = {
    name: 'randomnum',
    category: 'utility',
    aliases: ['rand'],
    description: 'Generate a random number between min and max',
    usage: '.randomnum <min> <max>',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const min = parseInt(args?.[0], 10);
        const max = parseInt(args?.[1], 10);

        if (isNaN(min) || isNaN(max) || min > max) {
            return reply('❌ Usage: .randomnum <min> <max>');
        }

        const result = Math.floor(Math.random() * (max - min + 1)) + min;
        return reply(`🎲 *RANDOM NUMBER*\n\n${result}`);
    }
};
