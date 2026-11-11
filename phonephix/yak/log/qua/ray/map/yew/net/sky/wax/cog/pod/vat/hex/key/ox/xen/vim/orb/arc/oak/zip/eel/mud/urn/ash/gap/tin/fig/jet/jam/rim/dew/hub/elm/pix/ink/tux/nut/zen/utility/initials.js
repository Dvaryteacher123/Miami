'use strict';
module.exports = {
    name: 'initials', category: 'utility', aliases: [],
    description: 'Get initials from a full name', usage: '.initials <full name>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const name = (args || []).join(' ').trim();
        if (!name) return reply('❌ Usage: .initials <full name>');
        const out = name.split(/\s+/).map((w) => w[0]?.toUpperCase()).join('.') + '.';
        return reply(`🔠 ${out}`);
    }
};
