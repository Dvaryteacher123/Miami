'use strict';
module.exports = {
    name: 'power', category: 'utility', aliases: ['pow'],
    description: 'Calculate base raised to exponent', usage: '.power <base> <exponent>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const base = parseFloat(args?.[0]), exp = parseFloat(args?.[1]);
        if (isNaN(base) || isNaN(exp)) return reply('❌ Usage: .power <base> <exponent>');
        return reply(`${base}^${exp} = ${Math.pow(base, exp)}`);
    }
};
