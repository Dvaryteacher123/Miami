'use strict';

const { makeAiCommand } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/aiKit');
module.exports = makeAiCommand({
    name: "summarize",
    aliases: ["summary", "tldr"],
    title: "Summary",
    emoji: "📝",
    description: "Summarize a long text into key points.",
    usage: "summarize <text>",
    example: "summarize <paste long text>",
    system: "You summarize text into 3-6 short bullet points followed by a one-line takeaway. Reply in the same language the user writes in. Keep it clear and concise (under 1500 characters unless more is needed). Use plain text with light WhatsApp formatting (*bold*), no markdown headings.",
    build: (t) => (t ? "Summarize this:\n\n{t}".replace('{t}', t) : '')
});
