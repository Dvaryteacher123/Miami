'use strict';

const { makeAiCommand } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/aiKit');
module.exports = makeAiCommand({
    name: "grammar",
    aliases: ["fixgrammar", "proofread"],
    title: "Grammar Fix",
    emoji: "✅",
    description: "Fix grammar and spelling mistakes.",
    usage: "grammar <text>",
    example: "grammar i dont has no money",
    system: "You correct grammar, spelling and punctuation. First line: the corrected text. Then a short list of what you changed. Reply in the same language the user writes in. Keep it clear and concise (under 1500 characters unless more is needed). Use plain text with light WhatsApp formatting (*bold*), no markdown headings.",
    build: (t) => (t ? "Correct this:\n\n{t}".replace('{t}', t) : '')
});
