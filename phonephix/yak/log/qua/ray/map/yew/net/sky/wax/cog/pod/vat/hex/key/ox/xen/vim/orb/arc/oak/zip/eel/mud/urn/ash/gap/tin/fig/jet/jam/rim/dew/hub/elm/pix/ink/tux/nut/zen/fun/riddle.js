'use strict';

const RIDDLES = [
    { q: 'What has to be broken before you can use it?', a: 'An egg' },
    { q: 'I speak without a mouth and hear without ears. What am I?', a: 'An echo' },
    { q: 'The more you take, the more you leave behind. What am I?', a: 'Footsteps' },
    { q: 'What has keys but no locks, space but no room, and you can enter but not go in?', a: 'A keyboard' },
    { q: 'What gets wetter as it dries?', a: 'A towel' }
];

module.exports = {
    name: 'riddle',
    category: 'fun',
    aliases: [],
    description: 'Get a random riddle',
    usage: '.riddle',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const r = RIDDLES[Math.floor(Math.random() * RIDDLES.length)];
        return reply(`🧩 *RIDDLE*\n\n${r.q}\n\n_Reply .riddle again for a new one. Answer: ${r.a}_`);
    }
};
