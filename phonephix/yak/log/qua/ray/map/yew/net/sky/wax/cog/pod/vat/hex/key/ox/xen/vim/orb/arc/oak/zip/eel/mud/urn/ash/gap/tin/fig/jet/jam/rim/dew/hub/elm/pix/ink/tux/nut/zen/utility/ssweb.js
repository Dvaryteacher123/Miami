'use strict';

const http = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/http');

module.exports = {
    name: 'ssweb',
    category: 'utility',
    aliases: ['webshot', 'ss'],
    description: 'Take a screenshot of a website',
    usage: '.ssweb <url>',
    emoji: '📸',
    cooldown: 8,

    async execute(ctx) {
        let url = (ctx.args || [])[0] || '';
        if (!url) return ctx.reply(`❌ Usage: ${ctx.prefix || '.'}ssweb https://example.com`);
        if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
        try { new URL(url); } catch (_) { return ctx.reply('❌ Invalid URL.'); }

        const api = `https://image.thum.io/get/width/1280/crop/800/noanimate/${url}`;
        const img = await http.get(api, { responseType: 'arraybuffer', timeout: 40000 });
        await ctx.sock.sendMessage(ctx.from, { image: Buffer.from(img), caption: `📸 ${url}` }, { quoted: ctx.msg });
    }
};
