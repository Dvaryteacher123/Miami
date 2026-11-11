'use strict';

const { makeAiCommand } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/aiKit');
module.exports = makeAiCommand({
    name: "aitranslate",
    aliases: ["aitr", "tr2"],
    title: "AI Translate",
    emoji: "🌍",
    description: "Translate text into any language.",
    usage: "aitranslate <language> <text>",
    example: "aitranslate swahili good morning my friend",
    system: "You are a professional translator. Output only the translation, nothing else.",
    // .aitranslate <language> <text>   (or reply to a message: .aitranslate <language>)
    build(text, args, quoted) {
        const lang = String((args && args[0]) || '').trim();
        const rest = (args || []).slice(1).join(' ').trim() || quoted || '';
        if (!lang || !rest) return '';
        return `Translate the following text into ${lang}:\n\n${rest}`;
    },
    useQuoted: false
});
