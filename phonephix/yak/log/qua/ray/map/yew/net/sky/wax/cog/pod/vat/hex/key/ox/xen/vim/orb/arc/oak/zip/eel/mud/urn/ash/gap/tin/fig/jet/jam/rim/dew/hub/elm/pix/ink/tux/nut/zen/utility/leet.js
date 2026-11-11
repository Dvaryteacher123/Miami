'use strict';

const MAP = { a: '4', e: '3', i: '1', o: '0', s: '5', t: '7', b: '8', g: '9' };

module.exports = {
    name: 'leet',
    category: 'utility',
    aliases: ['1337'],
    description: 'Convert text to leetspeak',
    usage: '.leet <text>',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const text = (args || []).join(' ').trim();
        if (!text) return reply('❌ Usage: .leet <text>');

        const out = text
            .toLowerCase()
            .split('')
            .map((c) => MAP[c] || c)
            .join('');

        return reply(`🕹️ *LEETSPEAK*\n\n${out}`);
    }
};
