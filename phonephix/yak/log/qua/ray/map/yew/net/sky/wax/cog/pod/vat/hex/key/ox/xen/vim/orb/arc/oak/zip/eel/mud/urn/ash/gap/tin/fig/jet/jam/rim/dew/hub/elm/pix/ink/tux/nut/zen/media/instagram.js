'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const youtubedl = require('youtube-dl-exec');

module.exports = {
    name: 'instagram',

    aliases: [
        'ig',
        'insta',
        'igdl'
    ],

    category: 'media',

    description: 'Download public Instagram videos',

    usage: '.instagram <Instagram URL>',

    ownerOnly: false,
    groupOnly: false,
    privateOnly: false,
    adminOnly: false,
    botAdminOnly: false,

    cooldown: 0,

    async run(ctx) {
        const { sock, msg, from, args } = ctx;

        let filePath = null;

        try {
            const input = Array.isArray(args)
                ? args.join(' ').trim()
                : String(args || '').trim();

            if (!input) {
                return await sock.sendMessage(
                    from,
                    {
                        text:
                            '📸 *PHONEPHIX INSTAGRAM DOWNLOADER*\n\n' +
                            'Send a public Instagram video/reel URL.\n\n' +
                            '*Example:*\n' +
                            '.instagram https://www.instagram.com/reel/xxxxx/\n\n' +
                            '*Aliases:*\n' +
                            '.ig\n' +
                            '.insta\n' +
                            '.igdl'
                    },
                    { quoted: msg }
                );
            }

            const match = input.match(
                /https?:\/\/(?:www\.)?instagram\.com\/[^\s]+/i
            );

            if (!match) {
                return await sock.sendMessage(
                    from,
                    {
                        text:
                            '❌ *Invalid Instagram URL.*\n\n' +
                            'Use a public Instagram post or Reel URL.'
                    },
                    { quoted: msg }
                );
            }

            const instagramUrl = match[0].replace(
                /[)>.,]+$/,
                ''
            );

            await sock.sendMessage(
                from,
                {
                    text:
                        '📸 *Instagram Downloader*\n\n' +
                        '⏳ Downloading video...\n' +
                        'Please wait.'
                },
                { quoted: msg }
            );

            const id = crypto
                .randomBytes(8)
                .toString('hex');

            const tempDir = path.join(
                os.tmpdir(),
                'phonephix-instagram'
            );

            fs.mkdirSync(
                tempDir,
                { recursive: true }
            );

            const outputTemplate =
                path.join(
                    tempDir,
                    `${id}.%(ext)s`
                );

            // Get video information first
            const info = await youtubedl(
                instagramUrl,
                {
                    dumpSingleJson: true,
                    noWarnings: true,
                    noPlaylist: true,
                    skipDownload: true,
                    preferFreeFormats: true,
                    noCheckCertificates: true
                }
            );

            const title =
                cleanText(
                    info?.title ||
                    info?.description ||
                    'Instagram Video'
                );

            // Download best available video
            await youtubedl(
                instagramUrl,
                {
                    output: outputTemplate,

                    format:
                        'best[ext=mp4]/best',

                    noWarnings: true,
                    noPlaylist: true,

                    noCheckCertificates: true,

                    restrictFilenames: true
                }
            );

            const files = fs.readdirSync(
                tempDir
            )
            .filter(file =>
                file.startsWith(id + '.')
            );

            if (!files.length) {
                throw new Error(
                    'Instagram video was not downloaded.'
                );
            }

            filePath = path.join(
                tempDir,
                files[0]
            );

            const stats =
                fs.statSync(filePath);

            if (!stats.size) {
                throw new Error(
                    'Downloaded file is empty.'
                );
            }

            // WhatsApp practical upload limit
            const maxSize =
                50 * 1024 * 1024;

            if (stats.size > maxSize) {
                throw new Error(
                    'Video is larger than 50MB.'
                );
            }

            await sock.sendMessage(
                from,
                {
                    video: {
                        url: filePath
                    },

                    mimetype:
                        'video/mp4',

                    caption:
                        `╭━━━〔 📸 PHONEPHIX INSTAGRAM 〕━━━╮\n` +
                        `┃\n` +
                        `┃ 🎬 ${title}\n` +
                        `┃\n` +
                        `┃ ⚡ Downloaded by PHONEPHIX BOT\n` +
                        `┃\n` +
                        `╰━━━━━━━━━━━━━━━━━━━━╯`
                },
                {
                    quoted: msg
                }
            );

        } catch (error) {
            console.error(
                '[INSTAGRAM ERROR]',
                error?.stderr ||
                error?.message ||
                error
            );

            let text =
                '❌ *Instagram download failed.*';

            if (
                String(error?.stderr || '')
                    .toLowerCase()
                    .includes('login')
            ) {
                text +=
                    '\n\n🔐 Instagram requested login. ' +
                    'Try a public Reel/post.';
            } else if (
                String(error?.message || '')
                    .toLowerCase()
                    .includes('larger than 50mb')
            ) {
                text +=
                    '\n\n📦 Video is too large for this bot.';
            } else {
                text +=
                    '\n\nTry another public Instagram Reel/post.';
            }

            await sock.sendMessage(
                from,
                {
                    text
                },
                { quoted: msg }
            );

        } finally {
            // Cleanup temporary files
            if (filePath) {
                try {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                } catch (_) {}
            }
        }
    }
};

function cleanText(text) {
    return String(text || '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 250);
                      }
