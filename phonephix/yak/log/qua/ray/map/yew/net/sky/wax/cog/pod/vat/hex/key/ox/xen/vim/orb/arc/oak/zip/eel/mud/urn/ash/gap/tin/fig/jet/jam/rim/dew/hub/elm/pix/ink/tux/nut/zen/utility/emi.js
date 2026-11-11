'use strict';
module.exports = {
    name: 'emi',
    category: 'utility',
    aliases: ['loanemi'],
    description: 'Calculate a fixed monthly loan installment (EMI)',
    usage: '.emi <principal> <annual_rate%> <months>',
    ownerOnly: false,
    cooldown: 5,
    async execute(ctx) {
        const reply = (t) => ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });
        const [p, r, n] = (ctx.args || []).map(parseFloat);
        if (!p || !r || !n) return reply(`❌ Usage: ${ctx.prefix || '.'}emi <principal> <annual_rate%> <months>`);
        const monthlyRate = r / 12 / 100;
        const emi = monthlyRate === 0
            ? p / n
            : (p * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
        const total = emi * n;
        return reply(`💰 *LOAN EMI*\n\nPrincipal: ${p}\nRate: ${r}% p.a.\nTenure: ${n} months\n\nMonthly EMI: ${emi.toFixed(2)}\nTotal payable: ${total.toFixed(2)}`);
    }
};
