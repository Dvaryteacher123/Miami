'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'waterintake',
    category: 'utility',
    aliases: [],
    description: 'Estimate daily water intake from body weight',
    usage: 'waterintake <weight kg>',
    needsInput: true,
    lines: false,
    run: ({ args }) => {
        const kg = Number(args[0]);
        if (!Number.isFinite(kg) || kg < 10 || kg > 400) throw new Error('Usage: .waterintake <weight in kg>');
        const l = kg * 0.035;
        return `💧 *WATER INTAKE*\n\n≈ ${l.toFixed(1)} litres per day\n≈ ${Math.round((l * 1000) / 250)} glasses (250 ml)\n\n_General guide only. Needs vary with heat and activity._`;
    }
});
