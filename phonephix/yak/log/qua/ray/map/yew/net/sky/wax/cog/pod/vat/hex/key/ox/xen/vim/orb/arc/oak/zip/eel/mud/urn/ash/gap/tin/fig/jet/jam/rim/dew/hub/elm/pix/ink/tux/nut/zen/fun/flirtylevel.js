'use strict';
module.exports = {
    name: 'flirtlevel', category: 'fun', aliases: [],
    description: 'Fun random flirt-level percentage for a name', usage: '.flirtlevel <name>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const name = (args || []).join(' ').trim();
        if (!name) return reply('❌ Usage: .flirtlevel <name>');
        let seed = 0;
        for (const c of name.toLowerCase()) seed += c.charCodeAt(0);
        return reply(`😏 ${name}'s flirt level: ${seed % 101}%`);
    }
};
