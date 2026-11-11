'use strict';

const crypto = require('crypto');

module.exports = {
    name: 'uuid',
    category: 'utility',
    aliases: ['guid'],
    description: 'Generate a random UUID v4',
    usage: '.uuid',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });
        return reply(`🆔 *UUID*\n\n${crypto.randomUUID()}`);
    }
};
