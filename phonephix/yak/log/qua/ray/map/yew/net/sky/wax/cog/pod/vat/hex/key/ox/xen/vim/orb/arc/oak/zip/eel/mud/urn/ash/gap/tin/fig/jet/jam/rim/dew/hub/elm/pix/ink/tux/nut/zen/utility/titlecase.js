'use strict';

module.exports = {
    name: 'titlecase',
    category: 'utility',
    aliases: [],
    description: 'Convert text to Title Case',
    usage: '.titlecase <text>',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const text = (args || []).join(' ');
        if (!text) return reply('❌ Usage: .titlecase <text>');

        const out = text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
        return reply(`🔠 *TITLE CASE*\n\n${out}`);
    }
};
