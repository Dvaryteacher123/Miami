'use strict';

/**
 * Sends a random high-resolution wallpaper using Picsum (a simple,
 * stable, no-API-key image redirect service). Fast and reliable.
 */

const axios = require('axios');

module.exports = {
    name: 'wallpaper',
    aliases: ['wp', 'randomimg'],
    category: 'media',
    description: 'Send a random high-resolution wallpaper',
    usage: '.wallpaper',
    ownerOnly: false,
    groupOnly: false,
    privateOnly: false,
    adminOnly: false,
    botAdminOnly: false,
    cooldown: 5,

    async run(ctx) {
        const { sock, msg, from } = ctx;

        try {
            const seed = Math.floor(Math.random() * 1e9);
            const url = `https://picsum.photos/seed/${seed}/1600/900`;

            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 20000,
                maxRedirects: 5
            });

            const buffer = Buffer.from(response.data);

            if (!buffer.length) throw new Error('Empty image received.');

            await sock.sendMessage(
                from,
                { image: buffer, caption: '🖼️ *Random Wallpaper*' },
                { quoted: msg }
            );
        } catch (error) {
            console.error('[WALLPAPER ERROR]', error);
            await sock.sendMessage(
                from,
                { text: `❌ *Failed to fetch wallpaper.*\n\n${error.message || 'Unknown error'}` },
                { quoted: msg }
            );
        }
    }
};
