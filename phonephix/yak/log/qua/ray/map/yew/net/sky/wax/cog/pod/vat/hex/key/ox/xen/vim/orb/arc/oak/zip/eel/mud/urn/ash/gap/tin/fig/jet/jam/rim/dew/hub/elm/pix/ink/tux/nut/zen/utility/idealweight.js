'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'idealweight',
    category: 'utility',
    aliases: [],
    description: 'Estimate ideal body weight (Devine formula)',
    usage: 'idealweight <male|female> <height cm>',
    needsInput: true,
    lines: false,
    run: ({ args }) => {
        const g = String(args[0] || '').toLowerCase();
        const cm = Number(args[1]);
        if (!['male', 'female'].includes(g) || !Number.isFinite(cm) || cm < 100 || cm > 250) throw new Error('Usage: .idealweight <male|female> <height in cm 100-250>');
        const over = Math.max(0, cm / 2.54 - 60);
        const kg = (g === 'male' ? 50 : 45.5) + 2.3 * over;
        return `⚖️ *IDEAL WEIGHT*\n\nEstimate: ${kg.toFixed(1)} kg\nRange: ${(kg * 0.9).toFixed(1)} - ${(kg * 1.1).toFixed(1)} kg\n\n_Rough estimate only, not medical advice._`;
    }
});
