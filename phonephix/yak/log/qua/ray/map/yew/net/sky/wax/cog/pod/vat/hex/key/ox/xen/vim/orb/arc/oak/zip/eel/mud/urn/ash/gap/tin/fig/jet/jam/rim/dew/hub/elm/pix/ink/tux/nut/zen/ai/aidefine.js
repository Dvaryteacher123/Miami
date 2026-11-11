'use strict';

const { makeAiCommand } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/aiKit');
module.exports = makeAiCommand({
    name: "aidefine",
    aliases: ["meaning", "whatis"],
    title: "Definition",
    emoji: "📚",
    description: "Get the meaning of a word or term with examples.",
    usage: "aidefine <word>",
    example: "aidefine inflation",
    system: "You are a dictionary. Give: the meaning in one simple sentence, two example sentences, and a synonym if there is one. Reply in the same language the user writes in. Keep it clear and concise (under 1500 characters unless more is needed). Use plain text with light WhatsApp formatting (*bold*), no markdown headings.",
    build: (t) => (t ? "Define: {t}".replace('{t}', t) : '')
});
