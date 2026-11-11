'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'triangle',
    category: 'utility',
    aliases: [],
    description: 'Area, perimeter and type from three sides',
    usage: 'triangle <a> <b> <c>',
    needsInput: true,
    lines: false,
    run: ({ args }) => {
        const [a, b, c] = args.slice(0, 3).map(Number);
        if ([a, b, c].some((v) => !Number.isFinite(v) || v <= 0)) throw new Error('Usage: .triangle <side a> <side b> <side c>');
        if (a + b <= c || a + c <= b || b + c <= a) throw new Error('These sides cannot form a triangle');
        const s = (a + b + c) / 2;
        const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
        const sd = [a, b, c].sort((x, y) => x - y);
        const type = (a === b && b === c) ? 'Equilateral' : (a === b || b === c || a === c) ? 'Isosceles' : 'Scalene';
        const right = Math.abs(sd[0] ** 2 + sd[1] ** 2 - sd[2] ** 2) < 1e-9 * Math.max(1, sd[2] ** 2) ? ' • Right-angled' : '';
        return `🔺 *TRIANGLE*\n\nSides: ${a}, ${b}, ${c}\nPerimeter: ${Number((a + b + c).toFixed(4))}\nArea: ${Number(area.toFixed(4))}\nType: ${type}${right}`;
    }
});
