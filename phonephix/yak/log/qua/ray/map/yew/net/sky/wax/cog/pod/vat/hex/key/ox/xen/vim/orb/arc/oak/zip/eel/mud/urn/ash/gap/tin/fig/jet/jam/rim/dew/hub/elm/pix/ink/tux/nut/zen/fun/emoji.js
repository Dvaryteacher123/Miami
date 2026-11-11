'use strict';

const EMOJIS = ['😂','🔥','💯','🎉','🚀','🌟','💪','🍕','🐶','🎸','⚽','🌈','🎮','☕','🌺'];

module.exports = {
    name: 'randomemoji',
    category: 'fun',
    aliases: [],
    description: 'Get random emojis',
    usage: '.randomemoji [count]',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        let count = parseInt(args?.[0], 10);
        if (!count || count < 1) count = 5;
        if (count > 30) count = 30;

        const out = Array.from({ length: count }, () => EMOJIS[Math.floor(Math.random() * EMOJIS.length)]).join(' ');
        return reply(out);
    }
};
