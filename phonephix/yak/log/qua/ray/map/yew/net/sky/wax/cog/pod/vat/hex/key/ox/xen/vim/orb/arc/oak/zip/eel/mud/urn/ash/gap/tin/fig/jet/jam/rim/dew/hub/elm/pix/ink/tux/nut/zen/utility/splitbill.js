'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'splitbill',
    category: 'utility',
    aliases: [],
    description: 'Split a bill between people (optional tip %)',
    usage: 'splitbill <total> <people> [tip%]',
    needsInput: true,
    lines: false,
    run: ({ args }) => {
        const total = Number(args[0]);
        const people = Math.floor(Number(args[1]));
        const tip = args[2] === undefined ? 0 : Number(args[2]);
        if (!Number.isFinite(total) || total <= 0 || !people || people < 1 || !Number.isFinite(tip) || tip < 0) throw new Error('Usage: .splitbill <total> <people> [tip%]');
        const fmt = (n) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });
        const withTip = total * (1 + tip / 100);
        return `🍽️ *SPLIT BILL*\n\nTotal: ${fmt(total)}\nTip: ${tip}%\nGrand total: ${fmt(withTip)}\nPeople: ${people}\n\n💰 Each pays: ${fmt(withTip / people)}`;
    }
});
