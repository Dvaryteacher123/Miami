'use strict';

const crypto = require('crypto');

module.exports = {
    name: 'passgen',
    category: 'utility',
    aliases: ['genpassword'],
    description: 'Generate a random secure password',
    usage: '.passgen [length]',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        let len = parseInt(args?.[0], 10);
        if (!len || len < 4) len = 12;
        if (len > 64) len = 64;

        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
        let out = '';
        const bytes = crypto.randomBytes(len);
        for (let i = 0; i < len; i++) out += chars[bytes[i] % chars.length];

        return reply(`🔑 *GENERATED PASSWORD*\n\n${out}`);
    }
};
