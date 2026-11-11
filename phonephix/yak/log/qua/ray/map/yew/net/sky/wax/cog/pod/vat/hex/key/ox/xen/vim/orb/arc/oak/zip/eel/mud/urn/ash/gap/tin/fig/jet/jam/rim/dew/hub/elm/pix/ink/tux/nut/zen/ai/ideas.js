'use strict';

const { makeAiCommand } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/aiKit');
module.exports = makeAiCommand({
    name: "ideas",
    aliases: ["brainstorm", "aiideas"],
    title: "Ideas",
    emoji: "🧠",
    description: "Brainstorm ideas for anything.",
    usage: "ideas <topic>",
    example: "ideas names for a phone repair shop",
    system: "You brainstorm creative, practical ideas. Give 8 numbered ideas, each one line. Reply in the same language the user writes in. Keep it clear and concise (under 1500 characters unless more is needed). Use plain text with light WhatsApp formatting (*bold*), no markdown headings.",
    build: (t) => (t ? "Brainstorm ideas for: {t}".replace('{t}', t) : '')
});
