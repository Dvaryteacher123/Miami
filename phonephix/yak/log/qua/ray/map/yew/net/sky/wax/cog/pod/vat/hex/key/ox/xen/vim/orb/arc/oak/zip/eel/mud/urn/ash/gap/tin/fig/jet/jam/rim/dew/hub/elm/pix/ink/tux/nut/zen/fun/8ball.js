'use strict';

const ANSWERS = [
    'Yes, definitely.', 'It is certain.', 'Without a doubt.', 'Yes.',
    'Most likely.', 'Ask again later.', 'Cannot predict now.',
    'Don\'t count on it.', 'My reply is no.', 'Very doubtful.', 'Outlook not so good.'
];

module.exports = {
    name: '8ball',
    category: 'fun',
    aliases: ['magic8ball'],
    description: 'Ask the magic 8-ball a question',
    usage: '.8ball <question>',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const question = (args || []).join(' ').trim();
        if (!question) return reply('❌ Usage: .8ball <question>');

        const answer = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
        return reply(`🎱 *MAGIC 8-BALL*\n\nQ: ${question}\nA: ${answer}`);
    }
};
