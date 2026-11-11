'use strict';

function shift(text, n) {
    return text.replace(/[a-zA-Z]/g, (c) => {
        const base = c <= 'Z' ? 65 : 97;
        return String.fromCharCode(((c.charCodeAt(0) - base + n + 26) % 26) + base);
    });
}

module.exports = {
    name: 'caesar',
    category: 'utility',
    aliases: ['rot'],
    description: 'Caesar cipher shift. .caesar <shift> <text>',
    usage: '.caesar 3 hello',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const n = parseInt(args?.[0], 10);
        const text = (args || []).slice(1).join(' ');
        if (isNaN(n) || !text) return reply('❌ Usage: .caesar <shift> <text>');

        return reply(`🔐 *CAESAR CIPHER*\n\n${shift(text, n)}`);
    }
};
