'use strict';

const { makeAiCommand } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/aiKit');
module.exports = makeAiCommand({
    name: "story",
    aliases: ["aistory", "shortstory"],
    title: "Short Story",
    emoji: "📖",
    description: "Write a short original story.",
    usage: "story <idea>",
    example: "story a boy who finds a talking bird",
    system: "You write short original stories (150-250 words) with a beginning, middle and satisfying end. Use the user's language if they wrote in one.",
    build: (t) => (t ? "Write a short story about: {t}".replace('{t}', t) : '')
});
