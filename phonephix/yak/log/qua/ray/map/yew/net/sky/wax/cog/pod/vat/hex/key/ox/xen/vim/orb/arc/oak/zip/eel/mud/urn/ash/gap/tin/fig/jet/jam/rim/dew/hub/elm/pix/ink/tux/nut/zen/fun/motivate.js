'use strict';
const LINES = [
    'Every expert was once a beginner. Keep going.',
    'You don\'t have to be great to start, but you have to start to be great.',
    'Small progress is still progress.',
    'Discipline beats motivation on hard days.',
    'Your future self is watching you right now through memories.'
];
module.exports = {
    name: 'motivate', category: 'fun', aliases: ['motivation'],
    description: 'Get a random motivational message', usage: '.motivate', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        return reply(`💪 ${LINES[Math.floor(Math.random() * LINES.length)]}`);
    }
};
