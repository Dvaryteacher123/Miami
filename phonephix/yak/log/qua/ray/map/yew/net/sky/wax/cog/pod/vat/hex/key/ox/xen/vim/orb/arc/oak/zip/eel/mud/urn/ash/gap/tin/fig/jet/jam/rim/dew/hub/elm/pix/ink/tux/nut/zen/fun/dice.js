'use strict';

module.exports = {
    name: 'dice',
    category: 'fun',
    aliases: ['roll'],
    description: 'Roll a six-sided die',
    usage: '.dice',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const result = Math.floor(Math.random() * 6) + 1;
        return reply(`🎲 *DICE ROLL*\n\nYou rolled a ${result}!`);
    }
};
