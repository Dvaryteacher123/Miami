'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'profit',
    category: 'utility',
    aliases: [],
    description: 'Profit, margin and markup from cost and selling price',
    usage: 'profit <cost> <selling price>',
    needsInput: true,
    lines: false,
    run: ({ args }) => {
        const cost = Number(args[0]);
        const sell = Number(args[1]);
        if (!Number.isFinite(cost) || !Number.isFinite(sell) || cost <= 0 || sell <= 0) throw new Error('Usage: .profit <cost> <selling price>');
        const fmt = (n) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });
        const p = sell - cost;
        return `💹 *PROFIT*\n\nCost: ${fmt(cost)}\nSelling: ${fmt(sell)}\n${p >= 0 ? '✅ Profit' : '❌ Loss'}: ${fmt(Math.abs(p))}\nMargin: ${((p / sell) * 100).toFixed(2)}%\nMarkup: ${((p / cost) * 100).toFixed(2)}%`;
    }
});
