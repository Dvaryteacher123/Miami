'use strict';

/**
 * .cuberoot - Cube root of a number
 */

module.exports = {
    name: 'cuberoot',
    category: 'utility',
    aliases: [],
    description: "Cube root of a number",
    usage: ".cuberoot 27",
    emoji: '🧊',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: String(t) }, { quoted: msg });
        const text = (args || []).join(' ').trim();
          const n = Number(args[0]);
          if (!args[0] || !Number.isFinite(n)) return reply('❌ Usage: .cuberoot 27');
          return reply('🧊 *CUBE ROOT*\n\n∛' + n + ' = ' + Number(Math.cbrt(n).toPrecision(12)));
    }
};
