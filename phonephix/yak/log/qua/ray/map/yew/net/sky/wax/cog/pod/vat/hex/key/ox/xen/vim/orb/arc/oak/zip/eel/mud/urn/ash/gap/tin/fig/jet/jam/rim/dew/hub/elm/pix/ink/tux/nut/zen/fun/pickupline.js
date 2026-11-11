'use strict';
const LINES = [
    'Are you a magician? Because whenever I look at you, everyone else disappears.',
    'Do you have a map? I keep getting lost in your eyes.',
    'Is your name Google? Because you have everything I\'ve been searching for.',
    'Are you made of copper and tellurium? Because you\'re Cu-Te.',
    'If you were a vegetable, you\'d be a cute-cumber.'
];
module.exports = {
    name: 'pickupline', category: 'fun', aliases: [],
    description: 'Get a random pickup line', usage: '.pickupline', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        return reply(`😘 ${LINES[Math.floor(Math.random() * LINES.length)]}`);
    }
};
