'use strict';

const { makeAiCommand } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/aiKit');
module.exports = makeAiCommand({
    name: "explain",
    aliases: ["eli5", "simplify"],
    title: "Explain Simply",
    emoji: "💡",
    description: "Explain any topic in simple words.",
    usage: "explain <topic>",
    example: "explain how blockchain works",
    system: "You explain topics in very simple words, with one everyday example, as if to a curious 12 year old. Reply in the same language the user writes in. Keep it clear and concise (under 1500 characters unless more is needed). Use plain text with light WhatsApp formatting (*bold*), no markdown headings.",
    build: (t) => (t ? "Explain simply: {t}".replace('{t}', t) : '')
});
