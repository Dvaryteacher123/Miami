'use strict';
module.exports = {
    name: 'isnumber', category: 'utility', aliases: [],
    description: 'Check if the given input is a valid number', usage: '.isnumber <value>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const value = args?.[0];
        if (value === undefined) return reply('❌ Usage: .isnumber <value>');
        const ok = value !== '' && !isNaN(Number(value));
        return reply(ok ? `✅ "${value}" is a valid number.` : `❌ "${value}" is not a valid number.`);
    }
};
