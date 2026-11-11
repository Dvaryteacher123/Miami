'use strict';

const { makeAiCommand } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/aiKit');
module.exports = makeAiCommand({
    name: "recipe",
    aliases: ["cook", "aicook"],
    title: "Recipe",
    emoji: "🍳",
    description: "Get a recipe for a dish or from the ingredients you have.",
    usage: "recipe <dish or ingredients>",
    example: "recipe chapati and beans",
    system: "You are a friendly chef. Give a short ingredient list and clear numbered steps. Keep it practical. Reply in the same language the user writes in. Keep it clear and concise (under 1500 characters unless more is needed). Use plain text with light WhatsApp formatting (*bold*), no markdown headings.",
    build: (t) => (t ? "Give me a recipe for / using: {t}".replace('{t}', t) : '')
});
