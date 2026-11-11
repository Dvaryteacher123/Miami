'use strict';

const crypto = require('crypto');

module.exports = {
    name: 'hash',
    category: 'utility',
    aliases: ['md5', 'sha256'],
    description: 'Hash text using md5/sha1/sha256',
    usage: '.hash <md5|sha1|sha256> <text>',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const algo = (args?.[0] || '').toLowerCase();
        const text = (args || []).slice(1).join(' ');

        if (!['md5', 'sha1', 'sha256'].includes(algo) || !text) {
            return reply('❌ Usage: .hash <md5|sha1|sha256> <text>');
        }

        const out = crypto.createHash(algo).update(text).digest('hex');
        return reply(`🔒 *${algo.toUpperCase()} HASH*\n\n${out}`);
    }
};
