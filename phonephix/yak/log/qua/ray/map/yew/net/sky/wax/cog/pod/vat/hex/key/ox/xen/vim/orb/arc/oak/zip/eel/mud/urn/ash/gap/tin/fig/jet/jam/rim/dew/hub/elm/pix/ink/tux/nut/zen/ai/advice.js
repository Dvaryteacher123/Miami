'use strict';

const { makeAiCommand } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/aiKit');
module.exports = makeAiCommand({
    name: "advice",
    aliases: ["tips", "guide"],
    title: "Advice",
    emoji: "🧭",
    description: "Get thoughtful, practical advice on a situation.",
    usage: "advice <your situation>",
    example: "advice how to save money on a small salary",
    system: "You give kind, practical, balanced advice with 4-6 concrete steps. For health, legal or money-critical matters, remind the user to consult a professional. Reply in the same language the user writes in. Keep it clear and concise (under 1500 characters unless more is needed). Use plain text with light WhatsApp formatting (*bold*), no markdown headings.",
    build: (t) => (t ? "I need advice: {t}".replace('{t}', t) : '')
});
