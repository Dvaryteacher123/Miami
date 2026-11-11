'use strict';

const { downloadMediaMessage } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../bot/baileys').get();
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const os = require('os');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = {
    name: 'gifmaker',
    aliases: ['gif', 'togif', 'makegif'],
    category: 'media',
    description: 'Convert a video into a GIF',
    usage: '.gifmaker',
    ownerOnly: false,
    groupOnly: false,
    privateOnly: false,
    adminOnly: false,
    botAdminOnly: false,
    cooldown: 10,

    async run(ctx) {
        const { sock, msg, from } = ctx;

        let inputPath;
        let outputPath;

        try {
            const contextInfo =
                msg.message?.extendedTextMessage?.contextInfo;

            const quoted = contextInfo?.quotedMessage;

            const videoMessage =
                msg.message?.videoMessage ||
                quoted?.videoMessage;

            if (!videoMessage) {
                return await sock.sendMessage(
                    from,
                    {
                        text:
                            '❌ *Reply to a video with `.gifmaker`*\n\n' +
                            'Example:\n' +
                            '🎥 Reply to video\n' +
                            '`.gifmaker`'
                    },
                    { quoted: msg }
                );
            }

            let targetMessage = msg;

            if (quoted) {
                targetMessage = {
                    key: {
                        remoteJid: from,
                        id: contextInfo.stanzaId,
                        participant: contextInfo.participant
                    },
                    message: quoted
                };
            }

            await sock.sendMessage(
                from,
                { text: '🎬 *Converting video to GIF...*' },
                { quoted: msg }
            );

            const buffer = await downloadMediaMessage(
                targetMessage,
                'buffer',
                {},
                { logger: console }
            );

            inputPath = path.join(
                os.tmpdir(),
                `phonephix-gif-${Date.now()}.mp4`
            );

            outputPath = path.join(
                os.tmpdir(),
                `phonephix-gif-${Date.now()}.gif`
            );

            fs.writeFileSync(inputPath, buffer);

            await new Promise((resolve, reject) => {
                ffmpeg(inputPath)
                    .inputOptions([
                        '-t 10'
                    ])
                    .outputOptions([
                        '-vf',
                        'fps=12,scale=480:-1:flags=lanczos',
                        '-loop',
                        '0'
                    ])
                    .format('gif')
                    .output(outputPath)
                    .on('end', resolve)
                    .on('error', reject)
                    .run();
            });

            const gif = fs.readFileSync(outputPath);

            await sock.sendMessage(
                from,
                {
                    document: gif,
                    mimetype: 'image/gif',
                    fileName: 'phonephix.gif',
                    caption: '🎬 *GIF created by PHONEPHIX BOT*'
                },
                { quoted: msg }
            );

        } catch (error) {
            console.error('[GIFMAKER ERROR]', error);

            await sock.sendMessage(
                from,
                {
                    text:
                        '❌ *Failed to create GIF.*\n\n' +
                        `Error: ${error.message || 'Unknown error'}`
                },
                { quoted: msg }
            );
        } finally {
            try {
                if (inputPath && fs.existsSync(inputPath)) {
                    fs.unlinkSync(inputPath);
                }

                if (outputPath && fs.existsSync(outputPath)) {
                    fs.unlinkSync(outputPath);
                }
            } catch (_) {}
        }
    }
};
