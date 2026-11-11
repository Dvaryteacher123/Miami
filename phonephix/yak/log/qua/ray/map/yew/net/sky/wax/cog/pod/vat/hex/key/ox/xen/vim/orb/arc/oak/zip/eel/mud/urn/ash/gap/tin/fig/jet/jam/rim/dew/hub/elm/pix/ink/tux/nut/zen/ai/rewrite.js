'use strict';

const { makeAiCommand } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/aiKit');
module.exports = makeAiCommand({
    name: "rewrite",
    aliases: ["rephrase", "paraphrase"],
    title: "Rewrite",
    emoji: "✍️",
    description: "Rewrite a text so it sounds clearer and better.",
    usage: "rewrite <text>",
    example: "rewrite me want to ask for job",
    system: "You rewrite text to be clearer, natural and well written while keeping the meaning. Return only the rewritten text. Reply in the same language the user writes in. Keep it clear and concise (under 1500 characters unless more is needed). Use plain text with light WhatsApp formatting (*bold*), no markdown headings.",
    build: (t) => (t ? "Rewrite this:\n\n{t}".replace('{t}', t) : '')
});
