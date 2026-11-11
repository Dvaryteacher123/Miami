'use strict';

const http = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/http');

module.exports = {
    name: 'wiki',
    category: 'utility',
    aliases: ['wikipedia'],
    description: 'Search Wikipedia (e.g. .wiki Kilimanjaro  or  .wiki sw Kilimanjaro)',
    usage: '.wiki [lang] <topic>',
    emoji: '📖',
    cooldown: 5,

    async execute(ctx) {
        const args = [...(ctx.args || [])];
        let lang = 'en';
        if (args.length > 1 && /^[a-z]{2,3}$/.test(args[0])) lang = args.shift();
        const q = args.join(' ').trim();
        if (!q) return ctx.reply(`❌ Usage: ${ctx.prefix || '.'}wiki Kilimanjaro`);

        const base = `https://${lang}.wikipedia.org`;
        let title = q;
        try {
            const s = await http.get(`${base}/w/api.php?action=opensearch&limit=1&format=json&search=${encodeURIComponent(q)}`);
            if (s && s[1] && s[1][0]) title = s[1][0];
        } catch (_) {}

        const d = await http.get(`${base}/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
        if (!d || !d.extract) return ctx.reply('❌ Nothing found.');

        const text = `📖 *${d.title}*\n\n${String(d.extract).slice(0, 1200)}\n\n🔗 ${d.content_urls?.mobile?.page || d.content_urls?.desktop?.page || ''}`;
        if (d.thumbnail?.source) {
            try {
                const img = await http.get(d.thumbnail.source, { responseType: 'arraybuffer' });
                return await ctx.sock.sendMessage(ctx.from, { image: Buffer.from(img), caption: text }, { quoted: ctx.msg });
            } catch (_) {}
        }
        return ctx.reply(text);
    }
};
