'use strict';

module.exports = {
    name: 'acronym',
    category: 'utility',
    aliases: [],
    description: 'Build an acronym from a phrase',
    usage: '.acronym <phrase>',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const phrase = (args || []).join(' ').trim();
        if (!phrase) return reply('❌ Usage: .acronym <phrase>');

        const acronym = phrase
            .split(/\s+/)
            .map((w) => w[0]?.toUpperCase() || '')
            .join('');

        return reply(`🔠 *ACRONYM*\n\n${acronym}`);
    }
};
