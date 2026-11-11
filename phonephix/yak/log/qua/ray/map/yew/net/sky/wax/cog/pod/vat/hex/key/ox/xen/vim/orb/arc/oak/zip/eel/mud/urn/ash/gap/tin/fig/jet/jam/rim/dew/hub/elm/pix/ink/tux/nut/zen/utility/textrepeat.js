'use strict';
module.exports = {
    name: 'textrepeat', category: 'utility', aliases: ['repeattext'],
    description: 'Repeat text N times: .textrepeat <count> <text>', usage: '.textrepeat 3 hi', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const count = parseInt(args?.[0], 10);
        const text = (args || []).slice(1).join(' ');
        if (!count || count < 1 || count > 50 || !text) return reply('❌ Usage: .textrepeat <count 1-50> <text>');
        return reply(Array(count).fill(text).join(' '));
    }
};
