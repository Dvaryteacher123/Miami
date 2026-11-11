'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'salestax',
    category: 'utility',
    aliases: [],
    description: 'Add sales tax to a price',
    usage: 'salestax <price> <rate%>',
    needsInput: true,
    lines: false,
    run: ({ args }) => {
        const p = Number(args[0]);
        const r = Number(args[1]);
        if (!Number.isFinite(p) || !Number.isFinite(r) || p < 0 || r < 0) throw new Error('Usage: .salestax <price> <rate%>');
        const fmt = (n) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });
        const tax = (p * r) / 100;
        return `🧾 *SALES TAX*\n\nPrice: ${fmt(p)}\nTax (${r}%): ${fmt(tax)}\nTotal: ${fmt(p + tax)}`;
    }
});
