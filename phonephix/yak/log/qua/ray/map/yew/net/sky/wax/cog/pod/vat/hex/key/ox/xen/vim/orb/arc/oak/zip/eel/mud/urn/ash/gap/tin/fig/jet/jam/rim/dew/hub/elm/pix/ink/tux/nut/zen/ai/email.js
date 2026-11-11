'use strict';

const { makeAiCommand } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/aiKit');
module.exports = makeAiCommand({
    name: "email",
    aliases: ["writemail", "draftemail"],
    title: "Email Draft",
    emoji: "📧",
    description: "Draft a professional email from a short description.",
    usage: "email <what it should say>",
    example: "email ask my landlord to fix the water pipe",
    system: "You write clear professional emails. Output: a Subject line, then the email body, polite and concise. Reply in the same language the user writes in. Keep it clear and concise (under 1500 characters unless more is needed). Use plain text with light WhatsApp formatting (*bold*), no markdown headings.",
    build: (t) => (t ? "Write an email: {t}".replace('{t}', t) : '')
});
