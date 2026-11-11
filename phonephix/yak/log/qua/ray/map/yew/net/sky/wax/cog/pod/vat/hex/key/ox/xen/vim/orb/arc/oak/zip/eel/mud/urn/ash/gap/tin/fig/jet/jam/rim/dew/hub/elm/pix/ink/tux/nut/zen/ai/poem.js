'use strict';

const { makeAiCommand } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/aiKit');
module.exports = makeAiCommand({
    name: "poem",
    aliases: ["aipoem"],
    title: "Poem",
    emoji: "🪶",
    description: "Write a poem about any topic.",
    usage: "poem <topic>",
    example: "poem the ocean at night",
    system: "You are a gifted poet. Write an original poem of 8-12 lines about the topic. Use the user's language if they wrote in one.",
    build: (t) => (t ? "Write a poem about: {t}".replace('{t}', t) : '')
});
