'use strict';
const LINES = [
    'The best time to plant a tree was 20 years ago. The second best time is now.',
    'Fall seven times, stand up eight.',
    'A smooth sea never made a skilled sailor.',
    'What you get by achieving your goals is not as important as what you become.',
    'The journey of a thousand miles begins with a single step.'
];
module.exports = {
    name: 'wisdom', category: 'fun', aliases: [],
    description: 'Get a random piece of wisdom', usage: '.wisdom', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        return reply(`📜 ${LINES[Math.floor(Math.random() * LINES.length)]}`);
    }
};
