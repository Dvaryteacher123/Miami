'use strict';

module.exports = {
    name: 'temp',
    category: 'utility',
    aliases: ['temperature'],
    description: 'Convert temperature between C and F: .temp 30c or .temp 86f',
    usage: '.temp 30c',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const input = (args?.[0] || '').toLowerCase();
        const match = input.match(/^(-?\d+(?:\.\d+)?)(c|f)$/);
        if (!match) return reply('❌ Usage: .temp 30c  or  .temp 86f');

        const value = parseFloat(match[1]);
        const unit = match[2];

        if (unit === 'c') {
            return reply(`🌡️ ${value}°C = ${((value * 9) / 5 + 32).toFixed(1)}°F`);
        }
        return reply(`🌡️ ${value}°F = ${(((value - 32) * 5) / 9).toFixed(1)}°C`);
    }
};
