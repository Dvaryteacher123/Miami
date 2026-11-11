'use strict';

/**
 * =====================================================
 *  TIKTOK DOWNLOADER — fast path
 *  Uses tikwm.com's public API (no watermark) instead of
 *  yt-dlp/python. This is much lighter and far more
 *  reliable on a shared panel: no binary download, no
 *  Python runtime, one HTTP request, instant response.
 * =====================================================
 */

const axios = require('axios');

const MAX_VIDEO_SIZE = 60 * 1024 * 1024;
const MAX_IMAGE_SIZE = 15 * 1024 * 1024;
const MAX_PHOTOS = 20;
const API_URL = 'https://www.tikwm.com/api/';

function getInputUrl(args) {
    if (!Array.isArray(args)) return '';
    return args.join(' ').trim();
}

function isTikTokUrl(value) {
    try {
        const u = new URL(value);
        return u.hostname === 'tiktok.com' || u.hostname.endsWith('.tiktok.com');
    } catch {
        return false;
    }
}

async function downloadBuffer(url, maxSize) {
    const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 45000,
        maxContentLength: maxSize,
        maxBodyLength: maxSize,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/131.0 Mobile Safari/537.36',
            Referer: 'https://www.tiktok.com/'
        }
    });

    const buffer = Buffer.from(response.data);
    if (!buffer.length) throw new Error('Downloaded file is empty.');
    return buffer;
}

async function fetchTikTokData(url) {
    const { data } = await axios.get(API_URL, {
        params: { url, hd: 1 },
        timeout: 20000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (!data || data.code !== 0 || !data.data) {
        throw new Error(data?.msg || 'TikTok link could not be resolved.');
    }

    return data.data;
}

module.exports = {
    name: 'tiktok',
    aliases: ['tt', 'tik', 'tiktokdl', 'ttdl'],
    category: 'media',
    description: 'Download TikTok video/photo without watermark',
    usage: '.tiktok <TikTok link>',
    ownerOnly: false,
    groupOnly: false,
    privateOnly: false,
    adminOnly: false,
    botAdminOnly: false,
    cooldown: 5,

    async run(ctx) {
        const { sock, msg, from, args } = ctx;
        const input = getInputUrl(args);

        if (!input) {
            return sock.sendMessage(
                from,
                {
                    text:
                        '❌ *Send a TikTok link.*\n\n' +
                        '.tiktok https://www.tiktok.com/@user/video/123\n' +
                        '.tiktok https://vm.tiktok.com/xxxxx'
                },
                { quoted: msg }
            );
        }

        if (!isTikTokUrl(input)) {
            return sock.sendMessage(from, { text: '❌ That is not a valid TikTok link.' }, { quoted: msg });
        }

        try {
            const data = await fetchTikTokData(input);

            // ---------- PHOTO / CAROUSEL ----------
            if (Array.isArray(data.images) && data.images.length) {
                const images = data.images.slice(0, MAX_PHOTOS);

                await sock.sendMessage(
                    from,
                    { text: `🖼️ *TikTok Photo/Carousel*\n\n📸 Photos: ${images.length}\n⏳ Sending...` },
                    { quoted: msg }
                );

                let sent = 0;
                for (let i = 0; i < images.length; i++) {
                    try {
                        const buffer = await downloadBuffer(images[i], MAX_IMAGE_SIZE);
                        await sock.sendMessage(
                            from,
                            { image: buffer, caption: `🖼️ *TikTok Photo ${i + 1}/${images.length}*` },
                            { quoted: i === 0 ? msg : undefined }
                        );
                        sent++;
                        await new Promise((r) => setTimeout(r, 400));
                    } catch (err) {
                        console.error(`[TikTok] Photo ${i + 1} failed:`, err.message);
                    }
                }

                if (!sent) throw new Error('None of the photos could be downloaded.');
                return;
            }

            // ---------- VIDEO ----------
            const videoUrl = data.hdplay || data.play;
            if (!videoUrl) throw new Error('TikTok video URL was not found.');

            const buffer = await downloadBuffer(videoUrl, MAX_VIDEO_SIZE);

            const title = String(data.title || 'TikTok Video').slice(0, 120);
            const author = data.author?.nickname || data.author?.unique_id || '';
            const stats = [
                data.play_count ? `▶️ ${data.play_count}` : null,
                data.digg_count ? `❤️ ${data.digg_count}` : null
            ].filter(Boolean).join('  ');

            const caption =
                `🎥 *${title}*\n\n` +
                `${author ? `👤 ${author}\n` : ''}` +
                `${stats ? `${stats}\n` : ''}` +
                `\n🤖 *PHONEPHIX BOT*`;

            await sock.sendMessage(from, { video: buffer, mimetype: 'video/mp4', caption }, { quoted: msg });
        } catch (error) {
            console.error('[TikTok] Error:', error?.message || error);

            let message = `❌ *TikTok download failed.*\n\n📌 ${error?.message || 'Unknown error'}`;
            const reason = String(error?.message || '').toLowerCase();

            if (reason.includes('too large') || reason.includes('maxcontentlength')) {
                message = `❌ *Video is too large.*\n\n📦 Maximum: ${Math.round(MAX_VIDEO_SIZE / 1024 / 1024)}MB`;
            }

            try {
                await sock.sendMessage(from, { text: message }, { quoted: msg });
            } catch (_) {}
        }
    }
};
