'use strict';
const MAP = { love: '❤️', happy: '😊', sad: '😢', fire: '🔥', star: '⭐', dog: '🐶', cat: '🐱', sun: '☀️', moon: '🌙', money: '💰' };
module.exports = {
    name: 'emojify', category: 'fun', aliases: [],
    description: 'Turn certain words in text into emojis', usage: '.emojify <text>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const text = (args || []).join(' ');
        if (!text) return reply('❌ Usage: .emojify <text>');
        const out = text.split(' ').map((w) => MAP[w.toLowerCase()] ? `${w}${MAP[w.toLowerCase()]}` : w).join(' ');
        return reply(out);
    }
};
