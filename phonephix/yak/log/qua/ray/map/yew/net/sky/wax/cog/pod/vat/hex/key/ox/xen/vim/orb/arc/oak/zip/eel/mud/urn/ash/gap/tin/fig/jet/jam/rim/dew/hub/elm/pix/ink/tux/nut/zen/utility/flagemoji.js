'use strict';
module.exports = {
    name: 'flagemoji', category: 'utility', aliases: ['flag'],
    description: 'Get the flag emoji for a 2-letter country code', usage: '.flagemoji TZ', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const code = (args?.[0] || '').toUpperCase();
        if (!/^[A-Z]{2}$/.test(code)) return reply('❌ Usage: .flagemoji <2-letter country code, e.g. TZ>');
        const flag = String.fromCodePoint(...code.split('').map((c) => 127397 + c.charCodeAt(0)));
        return reply(`${flag} ${code}`);
    }
};
