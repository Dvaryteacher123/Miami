'use strict';

/**
 * Converts a replied video/audio message into a WhatsApp voice note
 * (opus/ogg). Runs 100% locally with ffmpeg-static — no external API,
 * so it's fast and never fails from network issues.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const { downloadMediaMessage } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../bot/baileys').get();

ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = {
    name: 'toaudio',
    aliases: ['toptt', 'tovoice', 'tomp3'],
    category: 'media',
    description: 'Convert a replied video/audio into a voice note',
    usage: 'Reply to a video/audio with .toaudio',
    ownerOnly: false,
    groupOnly: false,
    privateOnly: false,
    adminOnly: false,
    botAdminOnly: false,
    cooldown: 5,

    async run(ctx) {
        const { sock, msg, from } = ctx;

        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const media =
            msg.message?.videoMessage ||
            msg.message?.audioMessage ||
            quoted?.videoMessage ||
            quoted?.audioMessage;

        if (!media) {
            return sock.sendMessage(
                from,
                { text: '❌ *Reply to a video or audio with `.toaudio`*' },
                { quoted: msg }
            );
        }

        let targetMessage = msg;
        if (quoted) {
            const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
            targetMessage = {
                key: { remoteJid: from, id: contextInfo?.stanzaId, participant: contextInfo?.participant },
                message: quoted
            };
        }

        const tmpIn = path.join(os.tmpdir(), `phonephix_${crypto.randomBytes(6).toString('hex')}.in`);
        const tmpOut = `${tmpIn}.ogg`;

        try {
            await sock.sendMessage(from, { text: '🔄 *Converting to voice note...*' }, { quoted: msg });

            const buffer = await downloadMediaMessage(targetMessage, 'buffer', {}, { logger: console });
            await fs.promises.writeFile(tmpIn, buffer);

            await new Promise((resolve, reject) => {
                ffmpeg(tmpIn)
                    .noVideo()
                    .audioCodec('libopus')
                    .audioBitrate('64k')
                    .format('ogg')
                    .on('end', resolve)
                    .on('error', reject)
                    .save(tmpOut);
            });

            const outBuffer = await fs.promises.readFile(tmpOut);

            await sock.sendMessage(
                from,
                { audio: outBuffer, mimetype: 'audio/ogg; codecs=opus', ptt: true },
                { quoted: msg }
            );
        } catch (error) {
            console.error('[TOAUDIO ERROR]', error);
            await sock.sendMessage(
                from,
                { text: `❌ *Conversion failed.*\n\n${error.message || 'Unknown error'}` },
                { quoted: msg }
            );
        } finally {
            fs.promises.unlink(tmpIn).catch(() => {});
            fs.promises.unlink(tmpOut).catch(() => {});
        }
    }
};
