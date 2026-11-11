'use strict';

const axios = require('axios');

const WIKIMEDIA_API =
    'https://commons.wikimedia.org/w/api.php';

module.exports = {
    name: 'photograph',

    aliases: [
        'photo',
        'pic',
        'image',
        'img'
    ],

    category: 'media',

    description: 'Search and send an image',

    usage: '.photograph <search>',

    ownerOnly: false,
    groupOnly: false,
    privateOnly: false,
    adminOnly: false,
    botAdminOnly: false,

    cooldown: 0,

    async run(ctx) {
        const { sock, msg, from, args } = ctx;

        try {
            // ==========================================
            // SEARCH QUERY
            // ==========================================

            const query = Array.isArray(args)
                ? args.join(' ').trim()
                : String(args || '').trim();

            if (!query) {
                return await sock.sendMessage(
                    from,
                    {
                        text:
                            '🖼️ *PHONEPHIX PHOTOGRAPH*\n\n' +
                            'Please enter what you want to search for.\n\n' +
                            '*Example:*\n' +
                            '`.photograph lion`\n' +
                            '`.photo car`\n' +
                            '`.image football`\n' +
                            '`.pic nature`'
                    },
                    { quoted: msg }
                );
            }

            // ==========================================
            // SEARCHING
            // ==========================================

            await sock.sendMessage(
                from,
                {
                    text:
                        `🔎 *Searching for image...*\n\n` +
                        `🖼️ ${query}`
                },
                { quoted: msg }
            );

            // ==========================================
            // WIKIMEDIA COMMONS SEARCH
            // ==========================================

            const response = await axios.get(
                WIKIMEDIA_API,
                {
                    params: {
                        action: 'query',
                        generator: 'search',
                        gsrsearch: query,
                        gsrnamespace: 6,
                        gsrlimit: 10,

                        prop: 'imageinfo',
                        iiprop: 'url|mime|size',
                        iiurlwidth: 1280,

                        format: 'json',
                        origin: '*'
                    },

                    timeout: 30000,

                    headers: {
                        'User-Agent':
                            'PHONEPHIX-BOT/1.0'
                    }
                }
            );

            const pages =
                response?.data?.query?.pages;

            if (!pages) {
                return await sock.sendMessage(
                    from,
                    {
                        text:
                            `❌ *No image found.*\n\n` +
                            `Search: ${query}\n\n` +
                            `Try another keyword.`
                    },
                    { quoted: msg }
                );
            }

            // ==========================================
            // GET VALID IMAGE RESULTS
            // ==========================================

            const results = Object.values(pages)
                .filter(page => {
                    const info =
                        page?.imageinfo?.[0];

                    if (!info?.url) return false;

                    const mime =
                        String(info.mime || '')
                            .toLowerCase();

                    return (
                        mime === 'image/jpeg' ||
                        mime === 'image/jpg' ||
                        mime === 'image/png' ||
                        mime === 'image/webp'
                    );
                });

            if (!results.length) {
                return await sock.sendMessage(
                    from,
                    {
                        text:
                            `❌ *No usable image found.*\n\n` +
                            `Search: ${query}`
                    },
                    { quoted: msg }
                );
            }

            // ==========================================
            // PICK RANDOM IMAGE
            // ==========================================

            const selected =
                results[
                    Math.floor(
                        Math.random() * results.length
                    )
                ];

            const imageInfo =
                selected.imageinfo?.[0];

            const imageUrl =
                imageInfo.thumburl ||
                imageInfo.url;

            const title =
                String(
                    selected.title ||
                    query
                )
                    .replace('File:', '')
                    .replace(/_/g, ' ')
                    .trim();

            // ==========================================
            // DOWNLOAD IMAGE
            // ==========================================

            const imageResponse = await axios.get(
                imageUrl,
                {
                    responseType: 'arraybuffer',
                    timeout: 60000,

                    maxContentLength:
                        15 * 1024 * 1024,

                    maxBodyLength:
                        15 * 1024 * 1024,

                    headers: {
                        'User-Agent':
                            'PHONEPHIX-BOT/1.0'
                    }
                }
            );

            const imageBuffer =
                Buffer.from(
                    imageResponse.data
                );

            if (!imageBuffer.length) {
                throw new Error(
                    'Image download returned empty data.'
                );
            }

            // ==========================================
            // SEND IMAGE
            // ==========================================

            await sock.sendMessage(
                from,
                {
                    image: imageBuffer,

                    caption:
                        `╭━━━〔 🖼️ PHONEPHIX PHOTO 〕━━━╮\n` +
                        `┃\n` +
                        `┃ 🔎 Search: ${query}\n` +
                        `┃ 📷 ${title}\n` +
                        `┃\n` +
                        `┃ 🌐 Source: Wikimedia Commons\n` +
                        `┃\n` +
                        `╰━━━━━━━━━━━━━━━━━━━━╯`
                },
                {
                    quoted: msg
                }
            );

        } catch (error) {
            console.error(
                '[PHOTOGRAPH ERROR]',
                error?.response?.data ||
                error?.message ||
                error
            );

            let errorMessage =
                '❌ *Failed to get the image.*';

            if (
                error?.code === 'ECONNABORTED' ||
                error?.code === 'ETIMEDOUT'
            ) {
                errorMessage +=
                    '\n\n⏱️ Image server took too long to respond.';
            }

            if (
                error?.response?.status === 429
            ) {
                errorMessage +=
                    '\n\n⚠️ Too many requests. Try again later.';
            }

            await sock.sendMessage(
                from,
                {
                    text: errorMessage
                },
                {
                    quoted: msg
                }
            );
        }
    }
};
