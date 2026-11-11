'use strict';

const {
    downloadMediaMessage
} = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../bot/baileys').get();

module.exports = {
    name: 'vv',
    aliases: ['viewonce', 'reveal'],
    category: 'media',
    description: 'Download and resend normal replied media',
    usage: '.vv',
    ownerOnly: false,
    groupOnly: false,
    privateOnly: false,
    adminOnly: false,
    botAdminOnly: false,
    cooldown: 0,

    async run(ctx) {
        const { sock, msg, from } = ctx;

        try {
            const contextInfo =
                msg.message?.extendedTextMessage?.contextInfo;

            const quoted = contextInfo?.quotedMessage;

            if (!quoted) {
                return await sock.sendMessage(
                    from,
                    {
                        text:
                            '❌ *Reply to a normal image, video, or audio.*\n\n' +
                            'Example:\n' +
                            '↩️ Reply to media → `.vv`'
                    },
                    { quoted: msg }
                );
            }

            // Detect View Once media
            const viewOnce =
                quoted?.viewOnceMessage ||
                quoted?.viewOnceMessageV2 ||
                quoted?.viewOnceMessageV2Extension ||
                quoted?.message?.viewOnceMessage ||
                quoted?.message?.viewOnceMessageV2;

            if (viewOnce) {
                return await sock.sendMessage(
                    from,
                    {
                        text:
                            '🔒 *View Once detected.*\n\n' +
                            'This command does not bypass View Once privacy protection.'
                    },
                    { quoted: msg }
                );
            }

            // Detect normal media
            const image =
                quoted?.imageMessage;

            const video =
                quoted?.videoMessage;

            const audio =
                quoted?.audioMessage;

            const document =
                quoted?.documentMessage;

            if (!image && !video && !audio && !document) {
                return await sock.sendMessage(
                    from,
                    {
                        text:
                            '❌ *Unsupported message.*\n\n' +
                            'Reply to a normal image, video, audio, or document.'
                    },
                    { quoted: msg }
                );
            }

            const targetMessage = {
                key: {
                    remoteJid: from,
                    id: contextInfo?.stanzaId,
                    participant: contextInfo?.participant
                },
                message: quoted
            };

            const buffer = await downloadMediaMessage(
                targetMessage,
                'buffer',
                {},
                {
                    logger: console
                }
            );

            if (!buffer || !buffer.length) {
                throw new Error('Media download returned empty data.');
            }

            // IMAGE
            if (image) {
                return await sock.sendMessage(
                    from,
                    {
                        image: buffer,
                        caption:
                            image.caption || ''
                    },
                    { quoted: msg }
                );
            }

            // VIDEO
            if (video) {
                return await sock.sendMessage(
                    from,
                    {
                        video: buffer,
                        caption:
                            video.caption || ''
                    },
                    { quoted: msg }
                );
            }

            // AUDIO
            if (audio) {
                return await sock.sendMessage(
                    from,
                    {
                        audio: buffer,
                        mimetype:
                            audio.mimetype || 'audio/mpeg',
                        ptt: !!audio.ptt
                    },
                    { quoted: msg }
                );
            }

            // DOCUMENT
            if (document) {
                return await sock.sendMessage(
                    from,
                    {
                        document: buffer,
                        mimetype:
                            document.mimetype ||
                            'application/octet-stream',
                        fileName:
                            document.fileName ||
                            'document'
                    },
                    { quoted: msg }
                );
            }

        } catch (error) {
            console.error(
                '[VV ERROR]',
                error
            );

            await sock.sendMessage(
                from,
                {
                    text:
                        '❌ *Failed to process the media.*\n\n' +
                        `${error?.message || 'Unknown error'}`
                },
                { quoted: msg }
            );
        }
    }
};
