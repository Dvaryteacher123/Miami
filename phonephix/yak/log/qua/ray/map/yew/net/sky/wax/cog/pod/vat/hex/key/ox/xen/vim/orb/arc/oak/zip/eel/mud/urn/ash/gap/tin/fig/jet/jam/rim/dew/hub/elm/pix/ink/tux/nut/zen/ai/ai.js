'use strict';

const { makeAiCommand } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/aiKit');
module.exports = makeAiCommand({
    name: "ai",
    aliases: ["gpt", "ask", "chatgpt"],
    title: "AI Assistant",
    emoji: "🤖",
    description: "Ask the AI anything.",
    usage: "ai <question>",
    example: "ai how do I start a small business?",
    system: "You are a helpful, friendly assistant inside a WhatsApp bot. Reply in the same language the user writes in. Keep it clear and concise (under 1500 characters unless more is needed). Use plain text with light WhatsApp formatting (*bold*), no markdown headings."
});
