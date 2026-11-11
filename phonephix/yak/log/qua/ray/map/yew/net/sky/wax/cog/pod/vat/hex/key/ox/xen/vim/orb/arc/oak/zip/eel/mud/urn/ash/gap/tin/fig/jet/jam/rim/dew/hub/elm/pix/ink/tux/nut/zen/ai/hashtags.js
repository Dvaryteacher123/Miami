'use strict';

const { makeAiCommand } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/aiKit');
module.exports = makeAiCommand({
    name: "hashtags",
    aliases: ["hashtag", "tags"],
    title: "Hashtags",
    emoji: "#️⃣",
    description: "Get trending-style hashtags for a topic.",
    usage: "hashtags <topic>",
    example: "hashtags small business Nairobi",
    system: "You suggest relevant hashtags. Give 15 hashtags in one block separated by spaces, mixing popular and niche ones. No extra text.",
    build: (t) => (t ? "Hashtags for: {t}".replace('{t}', t) : '')
});
