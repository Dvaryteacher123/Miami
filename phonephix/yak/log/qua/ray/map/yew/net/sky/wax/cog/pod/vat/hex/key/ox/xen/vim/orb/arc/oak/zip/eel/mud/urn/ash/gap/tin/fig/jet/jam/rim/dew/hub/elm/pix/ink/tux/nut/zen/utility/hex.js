'use strict';
module.exports = {
    name: 'hex', category: 'utility', aliases: ['tohex'],
    description: 'Encode/decode hex. .hex decode <hex>', usage: '.hex <text> | .hex decode <hex>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        if (!args || !args.length) return reply('❌ Usage: .hex <text>  or  .hex decode <hex>');
        if (args[0].toLowerCase() === 'decode') {
            try {
                const out = Buffer.from(args.slice(1).join(''), 'hex').toString('utf8');
                return reply(`🔓 ${out}`);
            } catch (e) { return reply('❌ Invalid hex string.'); }
        }
        const text = args.join(' ');
        return reply(`🔒 ${Buffer.from(text, 'utf8').toString('hex')}`);
    }
};
