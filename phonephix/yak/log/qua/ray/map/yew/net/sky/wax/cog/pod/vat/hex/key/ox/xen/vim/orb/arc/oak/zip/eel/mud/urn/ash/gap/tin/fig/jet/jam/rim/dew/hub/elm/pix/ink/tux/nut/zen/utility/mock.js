'use strict';

module.exports = {
    name: 'mock',
    category: 'fun',
    aliases: ['spongebob', 'mockingcase'],
    description: 'Convert text to sPoNgEbOb mOcKiNg case',
    usage: '.mock <text>',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const text = (args || []).join(' ');
        if (!text) return reply('❌ Usage: .mock <text>');

        const out = text.split('').map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase())).join('');
        return reply(`🐸 *MOCKING TEXT*\n\n${out}`);
    }
};
