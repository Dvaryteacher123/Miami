'use strict';
module.exports = {
    name: 'digitsum',
    category: 'utility',
    aliases: ['digitalroot'],
    description: 'Calculate the digit sum and digital root of a number',
    usage: '.digitsum <number>',
    ownerOnly: false,
    cooldown: 5,
    async execute(ctx) {
        const reply = (t) => ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });
        const raw = String(ctx.args?.[0] || '').replace(/[^\d]/g, '');
        if (!raw) return reply(`❌ Usage: ${ctx.prefix || '.'}digitsum <number>`);
        let sum = raw.split('').reduce((a, d) => a + Number(d), 0);
        let root = sum;
        while (root >= 10) {
            root = String(root).split('').reduce((a, d) => a + Number(d), 0);
        }
        return reply(`🔢 *DIGIT SUM*\n\nNumber: ${raw}\nDigit sum: ${sum}\nDigital root: ${root}`);
    }
};
