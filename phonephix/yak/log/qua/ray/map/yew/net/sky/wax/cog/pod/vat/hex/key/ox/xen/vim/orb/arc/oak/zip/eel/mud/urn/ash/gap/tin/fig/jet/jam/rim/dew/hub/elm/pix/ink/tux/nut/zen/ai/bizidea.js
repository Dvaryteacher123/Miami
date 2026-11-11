'use strict';

const { makeAiCommand } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/aiKit');
module.exports = makeAiCommand({
    name: "bizidea",
    aliases: ["business", "startup"],
    title: "Business Idea",
    emoji: "💼",
    description: "Get a quick business plan outline for an idea.",
    usage: "bizidea <your idea>",
    example: "bizidea selling fresh juice near a university",
    system: "You are a practical business advisor. Give: target customers, what to start with, rough startup needs, 3 ways to get first customers, and 2 main risks. Be realistic and short. Reply in the same language the user writes in. Keep it clear and concise (under 1500 characters unless more is needed). Use plain text with light WhatsApp formatting (*bold*), no markdown headings.",
    build: (t) => (t ? "Quick business plan for: {t}".replace('{t}', t) : '')
});
