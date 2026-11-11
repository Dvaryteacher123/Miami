'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'quadratic',
    category: 'utility',
    aliases: [],
    description: 'Solve a quadratic equation ax² + bx + c = 0',
    usage: 'quadratic <a> <b> <c>',
    needsInput: true,
    lines: false,
    run: ({ args }) => {
        const [a, b, c] = args.slice(0, 3).map(Number);
        if ([a, b, c].some((v) => !Number.isFinite(v)) || a === 0) throw new Error('Usage: .quadratic <a> <b> <c> (a cannot be 0)');
        const D = b * b - 4 * a * c;
        const f = (n) => Number(n.toFixed(6));
        let r;
        if (D > 0) r = `x₁ = ${f((-b + Math.sqrt(D)) / (2 * a))}\nx₂ = ${f((-b - Math.sqrt(D)) / (2 * a))}`;
        else if (D === 0) r = `x = ${f(-b / (2 * a))} (double root)`;
        else { const re = f(-b / (2 * a)); const im = Math.abs(f(Math.sqrt(-D) / (2 * a))); r = `x₁ = ${re} + ${im}i\nx₂ = ${re} - ${im}i`; }
        return `🧮 *QUADRATIC*\n\n${a}x² + ${b}x + ${c} = 0\nDiscriminant: ${D}\n\n${r}`;
    }
});
