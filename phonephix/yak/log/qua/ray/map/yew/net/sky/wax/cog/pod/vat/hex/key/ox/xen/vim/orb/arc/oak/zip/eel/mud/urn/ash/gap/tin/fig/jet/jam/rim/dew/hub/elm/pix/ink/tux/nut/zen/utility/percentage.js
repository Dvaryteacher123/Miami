'use strict';

module.exports = {
    name: 'percentage',
    category: 'utility',
    aliases: ['percent'],
    description: 'Calculate X percent of Y: .percentage <percent> <value>',
    usage: '.percentage 20 150',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const pct = parseFloat(args?.[0]);
        const value = parseFloat(args?.[1]);
        if (isNaN(pct) || isNaN(value)) return reply('❌ Usage: .percentage <percent> <value>');

        const result = (pct / 100) * value;
        return reply(`📐 *PERCENTAGE*\n\n${pct}% of ${value} = ${result}`);
    }
};
