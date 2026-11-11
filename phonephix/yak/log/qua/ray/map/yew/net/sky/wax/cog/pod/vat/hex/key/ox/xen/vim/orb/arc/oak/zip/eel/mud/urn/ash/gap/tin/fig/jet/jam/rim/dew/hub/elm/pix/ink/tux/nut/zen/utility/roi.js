'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'roi',
    category: 'utility',
    aliases: [],
    description: 'Return on investment',
    usage: 'roi <amount invested> <amount returned>',
    needsInput: true,
    lines: false,
    run: ({ args }) => {
        const inv = Number(args[0]);
        const ret = Number(args[1]);
        if (!Number.isFinite(inv) || !Number.isFinite(ret) || inv <= 0) throw new Error('Usage: .roi <amount invested> <amount returned>');
        const fmt = (n) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });
        const r = ((ret - inv) / inv) * 100;
        return `📈 *ROI*\n\nInvested: ${fmt(inv)}\nReturned: ${fmt(ret)}\nNet: ${fmt(ret - inv)}\nROI: ${r.toFixed(2)}%`;
    }
});
