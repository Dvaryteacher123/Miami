'use strict';
module.exports = {
    name: 'mirror', category: 'utility', aliases: [],
    description: 'Reverse each word in a sentence, keeping word order', usage: '.mirror <text>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const text = (args || []).join(' ');
        if (!text) return reply('❌ Usage: .mirror <text>');
        const out = text.split(' ').map((w) => w.split('').reverse().join('')).join(' ');
        return reply(`🪞 ${out}`);
    }
};
