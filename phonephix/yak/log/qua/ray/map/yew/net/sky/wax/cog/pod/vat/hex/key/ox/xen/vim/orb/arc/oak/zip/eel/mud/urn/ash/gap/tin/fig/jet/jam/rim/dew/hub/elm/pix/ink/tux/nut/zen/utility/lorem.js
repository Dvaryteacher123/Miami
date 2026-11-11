'use strict';

const WORDS = ('lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod ' +
    'tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis ' +
    'nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat').split(' ');

module.exports = {
    name: 'lorem',
    category: 'utility',
    aliases: ['loremipsum'],
    description: 'Generate placeholder Lorem Ipsum text',
    usage: '.lorem <word_count>',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        let count = parseInt(args?.[0], 10);
        if (!count || count < 1) count = 30;
        if (count > 300) count = 300;

        const out = [];
        for (let i = 0; i < count; i++) {
            out.push(WORDS[i % WORDS.length]);
        }
        const text = out.join(' ');
        return reply(`📝 *LOREM IPSUM*\n\n${text.charAt(0).toUpperCase() + text.slice(1)}.`);
    }
};
