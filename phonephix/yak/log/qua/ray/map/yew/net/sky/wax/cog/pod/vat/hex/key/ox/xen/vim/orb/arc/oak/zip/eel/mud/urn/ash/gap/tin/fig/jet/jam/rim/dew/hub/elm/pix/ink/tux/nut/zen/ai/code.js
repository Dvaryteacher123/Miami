'use strict';

const { makeAiCommand } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/aiKit');
module.exports = makeAiCommand({
    name: "code",
    aliases: ["aicode", "program"],
    title: "Code Helper",
    emoji: "💻",
    description: "Write code for a task you describe.",
    usage: "code <what you need>",
    example: "code javascript function to reverse a string",
    system: "You are an expert programmer. Reply with working code in one block (wrap in triple backticks) and at most 3 lines of explanation. If the language is not given, choose the most suitable.",
    build: (t) => (t ? "Write code for: {t}".replace('{t}', t) : '')
});
