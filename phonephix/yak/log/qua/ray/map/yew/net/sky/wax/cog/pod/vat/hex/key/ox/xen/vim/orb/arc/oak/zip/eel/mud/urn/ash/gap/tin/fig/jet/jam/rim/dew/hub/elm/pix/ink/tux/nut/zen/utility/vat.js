'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'vat',
    category: 'utility',
    aliases: [],
    description: 'VAT calculator (default 18%, add "inc" if price includes VAT)',
    usage: 'vat <amount> [rate%] [inc]',
    needsInput: true,
    lines: false,
    run: ({ args }) => {
        const inc = args.some((a) => String(a).toLowerCase() === 'inc');
        const nums = args.filter((a) => String(a).toLowerCase() !== 'inc').map(Number);
        const amount = nums[0];
        const rate = nums[1] === undefined ? 18 : nums[1];
        if (!Number.isFinite(amount) || !Number.isFinite(rate) || amount < 0 || rate < 0) throw new Error('Usage: .vat <amount> [rate%] [inc]');
        const fmt = (n) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });
        const net = inc ? amount / (1 + rate / 100) : amount;
        const vat = net * rate / 100;
        return `🧾 *VAT (${rate}%)*\n\nPrice ${inc ? 'incl. VAT' : 'excl. VAT'}: ${fmt(amount)}\nNet: ${fmt(net)}\nVAT: ${fmt(vat)}\nTotal: ${fmt(net + vat)}`;
    }
});
