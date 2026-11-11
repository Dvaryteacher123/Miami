'use strict';

module.exports = {
    name: 'truth',
    category: 'fun',
    aliases: ['t'],
    description: 'Get a random truth question',
    usage: '.truth',
    ownerOnly: false,
    cooldown: 5,

    async execute(ctx) {
        const reply = async (text, mentions = []) => {
            await ctx.sock.sendMessage(
                ctx.from,
                {
                    text: String(text),
                    mentions
                },
                { quoted: ctx.msg }
            );
        };

        const truths = [
            '🤔 What is one secret you have never told your friends?',
            '😂 What is the most embarrassing thing you have ever done?',
            '❤️ Have you ever had a crush on someone who did not know?',
            '😅 What is the biggest lie you have ever told?',
            '👀 Whose profile did you last check?',
            '🔥 What is one thing about you that most people do not know?'
        ];

        const question =
            truths[Math.floor(Math.random() * truths.length)];

        return reply(
            `╭━━━〔 🎯 TRUTH 〕━━━╮\n` +
            `┃\n` +
            `┃ ${question}\n` +
            `┃\n` +
            `╰━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
