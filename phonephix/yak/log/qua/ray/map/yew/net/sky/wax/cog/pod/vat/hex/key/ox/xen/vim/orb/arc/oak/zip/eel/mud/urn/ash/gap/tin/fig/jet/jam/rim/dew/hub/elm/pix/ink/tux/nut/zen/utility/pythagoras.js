'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'pythagoras',
    category: 'utility',
    aliases: [],
    description: 'Pythagoras: find the hypotenuse (or a leg with "leg")',
    usage: 'pythagoras <a> <b> [leg]',
    needsInput: true,
    lines: false,
    run: ({ args }) => {
        const a = Number(args[0]);
        const b = Number(args[1]);
        const leg = String(args[2] || '').toLowerCase() === 'leg';
        if (!Number.isFinite(a) || !Number.isFinite(b) || a <= 0 || b <= 0) throw new Error('Usage: .pythagoras <a> <b>   or   .pythagoras <leg> <hypotenuse> leg');
        if (leg) {
            if (b <= a) throw new Error('The hypotenuse must be longer than the leg');
            return `📐 *PYTHAGORAS*\n\nLeg: ${a}\nHypotenuse: ${b}\nOther leg: ${Number(Math.sqrt(b * b - a * a).toFixed(4))}`;
        }
        return `📐 *PYTHAGORAS*\n\nLegs: ${a} and ${b}\nHypotenuse: ${Number(Math.sqrt(a * a + b * b).toFixed(4))}`;
    }
});
