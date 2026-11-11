'use strict';
module.exports = {
    name: 'tip', category: 'utility', aliases: ['tipcalc'],
    description: 'Calculate tip amount: .tip <bill> <percent>', usage: '.tip 50 15', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const bill = parseFloat(args?.[0]), pct = parseFloat(args?.[1] || 10);
        if (isNaN(bill)) return reply('❌ Usage: .tip <bill> [percent]');
        const tipAmt = (bill * pct) / 100;
        return reply(`💵 *TIP CALCULATOR*\n\nBill: ${bill}\nTip (${pct}%): ${tipAmt.toFixed(2)}\nTotal: ${(bill + tipAmt).toFixed(2)}`);
    }
};
