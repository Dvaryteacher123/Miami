'use strict';

module.exports = {
    name: 'binary',
    category: 'utility',
    aliases: ['tobinary'],
    description: 'Encode/decode binary. Prefix with "decode " to decode.',
    usage: '.binary <text> | .binary decode <0101...>',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        if (!args || !args.length) return reply('❌ Usage: .binary <text>  or  .binary decode <binary>');

        if (args[0].toLowerCase() === 'decode') {
            const bits = args.slice(1).join(' ').split(/\s+/).filter(Boolean);
            try {
                const out = bits.map((b) => String.fromCharCode(parseInt(b, 2))).join('');
                return reply(`🔢 *DECODED*\n\n${out}`);
            } catch (e) {
                return reply('❌ Invalid binary input.');
            }
        }

        const text = args.join(' ');
        const out = text
            .split('')
            .map((c) => c.charCodeAt(0).toString(2).padStart(8, '0'))
            .join(' ');
        return reply(`🔢 *BINARY*\n\n${out}`);
    }
};
