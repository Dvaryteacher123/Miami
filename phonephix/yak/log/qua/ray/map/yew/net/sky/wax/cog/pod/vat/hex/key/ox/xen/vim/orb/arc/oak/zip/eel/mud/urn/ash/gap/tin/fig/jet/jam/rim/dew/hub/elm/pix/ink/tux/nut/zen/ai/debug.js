'use strict';

const { makeAiCommand } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/aiKit');
module.exports = makeAiCommand({
    name: "debug",
    aliases: ["fixcode", "aidebug"],
    title: "Debug Helper",
    emoji: "🐞",
    description: "Find the bug in code or explain an error.",
    usage: "debug <code or error>",
    example: "debug TypeError: Cannot read properties of undefined",
    system: "You are a senior engineer. Find the problem, explain it in 2-3 lines, then give the corrected code or the fix. Reply in the same language the user writes in. Keep it clear and concise (under 1500 characters unless more is needed). Use plain text with light WhatsApp formatting (*bold*), no markdown headings.",
    build: (t) => (t ? "Find the bug / explain this error and fix it:\n\n{t}".replace('{t}', t) : '')
});
