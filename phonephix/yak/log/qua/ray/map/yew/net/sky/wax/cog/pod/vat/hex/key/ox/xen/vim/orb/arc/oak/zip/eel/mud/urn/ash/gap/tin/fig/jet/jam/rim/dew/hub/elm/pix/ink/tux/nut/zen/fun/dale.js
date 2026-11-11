'use strict';

module.exports = {
    name: 'dare',
    category: 'fun',
    aliases: ['d'],
    description: 'Get a random dare',
    usage: '.dare',
    ownerOnly: false,
    cooldown: 5,

    async execute(ctx) {
        const reply = async text => {
            await ctx.sock.sendMessage(
                ctx.from,
                { text: String(text) },
                { quoted: ctx.msg }
            );
        };

        const dares = [
            'Send a funny selfie to the group.',
            'Type your next message with your eyes closed.',
            'Send a voice note saying "I am the funniest person here."',
            'Change your WhatsApp status to something funny.',
            'Use only emojis for your next 3 messages.',
            'Tell everyone your funniest joke.',
            'Send a random GIF.',
            'Compliment the person above you.',
            'Write a sentence using only 5 words.',
            'Send your best pickup line.'
        ];

        const dare =
            dares[Math.floor(Math.random() * dares.length)];

        return reply(
            `🔥 *DARE*\n\n` +
            `👉 ${dare}`
        );
    }
};
