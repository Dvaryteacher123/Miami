'use strict';

module.exports = {
    name: 'coinflip',
    category: 'fun',
    aliases: ['flipcoin'],
    description: 'Flip a coin',
    usage: '.coinflip',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const result = Math.random() < 0.5 ? 'Heads 🪙' : 'Tails 🪙';
        return reply(`🪙 *COIN FLIP*\n\n${result}`);
    }
};
