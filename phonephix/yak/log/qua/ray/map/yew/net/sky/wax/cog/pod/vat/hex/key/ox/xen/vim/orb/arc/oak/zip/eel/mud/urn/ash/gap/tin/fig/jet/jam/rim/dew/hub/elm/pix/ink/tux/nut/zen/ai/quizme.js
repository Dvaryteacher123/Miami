'use strict';

const { makeAiCommand } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/aiKit');
module.exports = makeAiCommand({
    name: "quizme",
    aliases: ["quiz2", "aiquiz"],
    title: "Quiz",
    emoji: "🎯",
    description: "Get a 5-question quiz on any topic.",
    usage: "quizme <topic>",
    example: "quizme world geography",
    system: "You create quizzes. Write 5 multiple choice questions with options A-D. Put the answer key at the very end in one line. Reply in the same language the user writes in. Keep it clear and concise (under 1500 characters unless more is needed). Use plain text with light WhatsApp formatting (*bold*), no markdown headings.",
    build: (t) => (t ? "Make a quiz about: {t}".replace('{t}', t) : '')
});
