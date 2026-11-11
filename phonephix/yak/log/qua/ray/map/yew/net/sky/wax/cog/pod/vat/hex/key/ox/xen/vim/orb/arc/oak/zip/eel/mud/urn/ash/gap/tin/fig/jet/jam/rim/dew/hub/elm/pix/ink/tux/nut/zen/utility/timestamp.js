'use strict';

module.exports = {
    name: 'timestamp',
    category: 'utility',
    aliases: ['unixtime'],
    description: 'Get current unix timestamp or convert one',
    usage: '.timestamp [unix_time]',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        if (args?.[0]) {
            const n = parseInt(args[0], 10);
            if (isNaN(n)) return reply('❌ Provide a valid unix timestamp (seconds).');
            const date = new Date(n * 1000);
            return reply(`🕐 *TIMESTAMP*\n\n${n} → ${date.toUTCString()}`);
        }

        const now = Math.floor(Date.now() / 1000);
        return reply(`🕐 *CURRENT TIMESTAMP*\n\n${now}`);
    }
};
