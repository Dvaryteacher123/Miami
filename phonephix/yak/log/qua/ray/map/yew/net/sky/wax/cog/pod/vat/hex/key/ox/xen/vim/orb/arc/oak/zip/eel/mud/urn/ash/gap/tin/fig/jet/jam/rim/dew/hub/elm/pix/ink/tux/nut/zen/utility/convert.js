'use strict';

const UNITS = {
    kmtomiles: (v) => v * 0.621371,
    milestokm: (v) => v / 0.621371,
    kgtolbs: (v) => v * 2.20462,
    lbstokg: (v) => v / 2.20462,
    ctof: (v) => (v * 9) / 5 + 32,
    ftoc: (v) => ((v - 32) * 5) / 9,
    mtoft: (v) => v * 3.28084,
    fttom: (v) => v / 3.28084
};

module.exports = {
    name: 'convert',
    category: 'utility',
    aliases: ['unitconvert'],
    description: 'Convert units: kmtomiles, milestokm, kgtolbs, lbstokg, ctof, ftoc, mtoft, fttom',
    usage: '.convert kmtomiles 10',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const type = (args?.[0] || '').toLowerCase();
        const value = parseFloat(args?.[1]);

        if (!UNITS[type] || isNaN(value)) {
            return reply(`❌ Usage: .convert <type> <value>\n\nTypes: ${Object.keys(UNITS).join(', ')}`);
        }

        const result = UNITS[type](value);
        return reply(`🔄 *CONVERSION*\n\n${value} → ${result.toFixed(2)}`);
    }
};
