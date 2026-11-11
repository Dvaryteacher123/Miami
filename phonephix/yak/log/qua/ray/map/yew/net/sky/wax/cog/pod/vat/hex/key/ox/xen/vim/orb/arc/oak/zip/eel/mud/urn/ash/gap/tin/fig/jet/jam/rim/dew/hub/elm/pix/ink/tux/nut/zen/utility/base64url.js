'use strict';

module.exports = {
    name: 'base64url',
    category: 'utility',
    aliases: [],
    description: 'URL-safe base64 encode/decode. .base64url decode <text>',
    usage: '.base64url <text> | .base64url decode <text>',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        if (!args || !args.length) return reply('❌ Usage: .base64url <text>');

        if (args[0].toLowerCase() === 'decode') {
            const text = args.slice(1).join(' ');
            try {
                const out = Buffer.from(text.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
                return reply(`🔓 *DECODED*\n\n${out}`);
            } catch (e) {
                return reply('❌ Invalid base64url string.');
            }
        }

        const text = args.join(' ');
        const out = Buffer.from(text, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        return reply(`🔒 *ENCODED*\n\n${out}`);
    }
};
