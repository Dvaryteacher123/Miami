'use strict';
const QUESTIONS = [
    'Never have I ever forgotten someone\'s name right after meeting them.',
    'Never have I ever sent a text to the wrong person.',
    'Never have I ever fallen asleep during a movie.',
    'Never have I ever laughed so hard I cried.',
    'Never have I ever missed an alarm and been late for something important.'
];
module.exports = {
    name: 'neverhaveiever', category: 'fun', aliases: ['nhie'],
    description: 'Get a random "never have I ever" statement', usage: '.neverhaveiever', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        return reply(`🙊 ${QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]}`);
    }
};
