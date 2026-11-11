'use strict';

const { makeAiCommand } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/aiKit');
module.exports = makeAiCommand({
    name: "caption",
    aliases: ["aicaption", "igcaption"],
    title: "Social Captions",
    emoji: "📸",
    description: "Get catchy social media captions.",
    usage: "caption <what the post is about>",
    example: "caption my birthday dinner with friends",
    system: "You write catchy social media captions. Give 5 different captions with fitting emojis, each on its own line. Reply in the same language the user writes in. Keep it clear and concise (under 1500 characters unless more is needed). Use plain text with light WhatsApp formatting (*bold*), no markdown headings.",
    build: (t) => (t ? "Write captions for a post about: {t}".replace('{t}', t) : '')
});
