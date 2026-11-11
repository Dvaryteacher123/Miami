'use strict';

module.exports = {
    name: 'reverse',
    category: 'utility',
    aliases: ['flip'],
    description: 'Reverse the given text',
    usage: '.reverse <text>',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const text = (args || []).join(' ').trim();
        if (!text) return reply('❌ Usage: .reverse <text>');

        return reply(`🔁 *REVERSED*\n\n${text.split('').reverse().join('')}`);
    }
};
