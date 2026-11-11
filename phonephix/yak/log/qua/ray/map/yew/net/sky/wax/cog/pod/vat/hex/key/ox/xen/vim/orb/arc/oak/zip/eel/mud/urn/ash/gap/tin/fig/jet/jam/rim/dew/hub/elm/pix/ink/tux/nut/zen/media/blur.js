'use strict';

const { downloadMediaMessage } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../bot/baileys').get();
const sharp = require('sharp');

module.exports = {
    name: 'blur',
    aliases: ['blurimage', 'blurry', 'tblur'],
    category: 'media',
    description: 'Blur an image',
    usage: '.blur',
    ownerOnly: false,
    groupOnly: false,
    privateOnly: false,
    adminOnly: false,
    botAdminOnly: false,
    cooldown: 5,

    async run(ctx) {
        const { sock, msg, from } = ctx;

        try {
            const quoted =
                msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            const imageMessage =
                msg.message?.imageMessage ||
                quoted?.imageMessage;

            if (!imageMessage) {
                return await sock.sendMessage(
                    from,
                    {
                        text:
                            '❌ *Send or reply to an image with `.blur`*\n\n' +
                            'Example:\n' +
                            '📸 Send image + `.blur`\n' +
                            '↩️ Reply to image + `.blur`'
                    },
                    { quoted: msg }
                );
            }

            let targetMessage = msg;

            if (quoted) {
                const contextInfo =
                    msg.message?.extendedTextMessage?.contextInfo;

                targetMessage = {
                    key: {
                        remoteJid: from,
                        id: contextInfo?.stanzaId,
                        participant: contextInfo?.participant
                    },
                    message: quoted
                };
            }

            await sock.sendMessage(
                from,
                { text: '🔄 *Blurring image...*' },
                { quoted: msg }
            );

            const buffer = await downloadMediaMessage(
                targetMessage,
                'buffer',
                {},
                { logger: console }
            );

            const blurred = await sharp(buffer)
                .blur(12)
                .jpeg({ quality: 90 })
                .toBuffer();

            await sock.sendMessage(
                from,
                {
                    image: blurred,
                    caption: '🌫️ *Blurred image*'
                },
                { quoted: msg }
            );

        } catch (error) {
            console.error('[BLUR ERROR]', error);

            await sock.sendMessage(
                from,
                {
                    text:
                        '❌ *Failed to blur image.*\n\n' +
                        `Error: ${error.message || 'Unknown error'}`
                },
                { quoted: msg }
            );
        }
    }
};
