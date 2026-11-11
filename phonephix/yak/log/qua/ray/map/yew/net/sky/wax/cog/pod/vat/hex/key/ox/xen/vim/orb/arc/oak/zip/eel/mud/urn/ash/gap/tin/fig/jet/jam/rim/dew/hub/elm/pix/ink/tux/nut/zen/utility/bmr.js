'use strict';
module.exports = {
    name: 'bmr',
    category: 'utility',
    aliases: [],
    description: 'Estimate Basal Metabolic Rate (Mifflin-St Jeor formula)',
    usage: '.bmr <male/female> <kg> <cm> <age>',
    ownerOnly: false,
    cooldown: 5,
    async execute(ctx) {
        const reply = (t) => ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });
        const [genderRaw, kg, cm, age] = ctx.args || [];
        const gender = String(genderRaw || '').toLowerCase();
        const weight = parseFloat(kg);
        const height = parseFloat(cm);
        const years = parseFloat(age);
        if (!['male', 'female'].includes(gender) || !weight || !height || !years) {
            return reply(`❌ Usage: ${ctx.prefix || '.'}bmr <male/female> <kg> <cm> <age>`);
        }
        const base = 10 * weight + 6.25 * height - 5 * years;
        const bmr = gender === 'male' ? base + 5 : base - 161;
        return reply(`🔥 *ESTIMATED BMR*\n\n≈ ${Math.round(bmr)} kcal/day at rest\n\n_Rough estimate only, not medical advice._`);
    }
};
