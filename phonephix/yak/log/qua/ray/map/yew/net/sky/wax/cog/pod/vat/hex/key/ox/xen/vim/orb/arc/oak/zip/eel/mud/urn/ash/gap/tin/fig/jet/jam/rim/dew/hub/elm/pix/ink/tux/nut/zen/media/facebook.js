'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const youtubedl = require('youtube-dl-exec');

module.exports = {
    name: 'facebook',

    aliases: [
        'fb',
        'fbdl',
        'facebookdl'
    ],

    category: 'media',

    description: 'Download public Facebook videos',

    usage: '.facebook <Facebook URL>',

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
                            '📘 *PHONEPHIX FACEBOOK DOWNLOADER*\n\n' +
                            'Send a public Facebook video/Reel URL.\n\n' +
                            '*Example:*\n' +
                            '.facebook https://www.facebook.com/reel/xxxxx\n\n' +
                            '*Aliases:*\n' +
                            '.fb\n' +
                            '.fbdl'
                    },
                    { quoted: msg }
                );
            }

            const match = input.match(
                /https?:\/\/(?:www\.|m\.)?(?:facebook\.com|fb\.watch)\/[^\s]+/i
            );

            if (!match) {
                return await sock.sendMessage(
                    from,
                    {
                        text:
                            '❌ *Invalid Facebook URL.*\n\n' +
                            'Send a public Facebook video, Reel, or fb.watch link.'
                    },
                    { quoted: msg }
                );
            }

            const facebookUrl =
                match[0].replace(
                    /[)>.,]+$/,
                    ''
                );

            await sock.sendMessage(
                from,
                {
                    text:
                        '📘 *Facebook Downloader*\n\n' +
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
                'phonephix-facebook'
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

            const info = await youtubedl(
                facebookUrl,
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
                    'Facebook Video'
                );

            await youtubedl(
                facebookUrl,
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
                    'Facebook video was not downloaded.'
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
                        `╭━━━〔 📘 PHONEPHIX FACEBOOK 〕━━━╮\n` +
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
                '[FACEBOOK ERROR]',
                error?.stderr ||
                error?.message ||
                error
            );

            let text =
                '❌ *Facebook download failed.*';

            if (
                String(error?.stderr || '')
                    .toLowerCase()
                    .includes('login')
            ) {
                text +=
                    '\n\n🔐 Facebook requested login. ' +
                    'Try a public video/Reel.';
            } else if (
                String(error?.message || '')
                    .toLowerCase()
                    .includes('larger than 50mb')
            ) {
                text +=
                    '\n\n📦 Video is too large for this bot.';
            } else {
                text +=
                    '\n\nTry another public Facebook video.';
            }

            await sock.sendMessage(
                from,
                {
                    text
                },
                { quoted: msg }
            );

        } finally {
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
