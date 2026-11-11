'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'circle',
    category: 'utility',
    aliases: [],
    description: 'Area, circumference and diameter from a radius',
    usage: 'circle <radius>',
    needsInput: true,
    lines: false,
    run: ({ args }) => {
        const r = Number(args[0]);
        if (!Number.isFinite(r) || r <= 0) throw new Error('Usage: .circle <radius>');
        const f = (n) => Number(n.toFixed(4));
        return `⭕ *CIRCLE*\n\nRadius: ${r}\nDiameter: ${f(2 * r)}\nCircumference: ${f(2 * Math.PI * r)}\nArea: ${f(Math.PI * r * r)}`;
    }
});
