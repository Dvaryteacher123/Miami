'use strict';

module.exports = {
    name: 'bmi',
    category: 'utility',
    aliases: [],
    description: 'Calculate Body Mass Index',
    usage: '.bmi <weight_kg> <height_cm>',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const kg = parseFloat(args?.[0]);
        const cm = parseFloat(args?.[1]);

        if (!kg || !cm) return reply('❌ Usage: .bmi <weight_kg> <height_cm>');

        const m = cm / 100;
        const bmi = kg / (m * m);
        let category = 'Normal weight';
        if (bmi < 18.5) category = 'Underweight';
        else if (bmi >= 25 && bmi < 30) category = 'Overweight';
        else if (bmi >= 30) category = 'Obese';

        return reply(`⚖️ *BMI RESULT*\n\nBMI: ${bmi.toFixed(1)}\nCategory: ${category}`);
    }
};
