'use strict';

const https = require('https');

function shortenUrl(url) {
    return new Promise((resolve, reject) => {
        const api =
            `https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`;

        https.get(api, (res) => {
            let data = '';

            res.on('data', chunk => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode !== 200) {
                    return reject(
                        new Error(`HTTP ${res.statusCode}`)
                    );
                }

                resolve(data.trim());
            });
        }).on('error', reject);
    });
}

module.exports = {
    name: 'shorturl',
    category: 'utility',
    aliases: ['short', 'tinyurl'],
    description: 'Shorten a URL',
    usage: '.shorturl https://example.com',
    ownerOnly: false,
    cooldown: 10,

    async execute(ctx) {
        const reply = async (text) => {
            await ctx.sock.sendMessage(
                ctx.from,
                { text: String(text) },
                { quoted: ctx.msg }
            );
        };

        try {
            const url = Array.isArray(ctx.args)
                ? ctx.args.join(' ').trim()
                : '';

            if (!url) {
                return reply(
                    '❌ Weka URL.\n\n' +
                    'Mfano:\n' +
                    '`.shorturl https://example.com`'
                );
            }

            if (!/^https?:\/\/\S+$/i.test(url)) {
                return reply(
                    '❌ That is not a valid URL.\n\n' +
                    'The URL must start with `http://` or `https://`.'
                );
            }

            const shortUrl = await shortenUrl(url);

            if (!shortUrl || !/^https?:\/\//i.test(shortUrl)) {
                return reply('❌ Imeshindwa kufupisha URL.');
            }

            return reply(
                `🔗 *URL SHORTENER*\n\n` +
                `📌 Original:\n${url}\n\n` +
                `⚡ Short URL:\n${shortUrl}`
            );

        } catch (error) {
            console.error('[SHORTURL ERROR]', error);

            return reply(
                `❌ Imeshindwa kufupisha URL.\n\n${error?.message || error}`
            );
        }
    }
};
