'use strict';

const { makeAiCommand } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/aiKit');
module.exports = makeAiCommand({
    name: "aijoke",
    aliases: ["funny", "makejoke"],
    title: "AI Joke",
    emoji: "😂",
    description: "Get a joke about any topic.",
    usage: "aijoke <topic>",
    example: "aijoke exams",
    system: "You tell clean, funny jokes suitable for everyone. Give 2 short jokes. Use the user's language if they wrote in one.",
    build: (t) => (t ? "Tell me jokes about: {t}".replace('{t}', t) : '')
});
