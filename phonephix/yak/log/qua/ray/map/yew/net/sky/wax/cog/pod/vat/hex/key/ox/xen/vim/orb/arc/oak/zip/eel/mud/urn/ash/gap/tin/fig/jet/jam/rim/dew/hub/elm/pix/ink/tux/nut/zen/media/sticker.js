'use strict';

const { downloadMediaMessage } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../bot/baileys').get();
const sharp = require('sharp');

module.exports = {
    name: 'sticker',
    aliases: ['s', 'stiker', 'stik'],
    category: 'media',
    description: 'Convert an image into a sticker',
    usage: '.sticker',
    ownerOnly: false,
    groupOnly: false,
    privateOnly: false,
    adminOnly: false,
    botAdminOnly: false,
    cooldown: 0,

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
                            '❌ *Please send or reply to an image with `.sticker`*\n\n' +
                            'Example:\n' +
                            '📸 Send an image with `.sticker`\n' +
                            '↩️ Reply to an image with `.sticker`'
                    },
                    { quoted: msg }
                );
            }

            let targetMessage = msg;

            // If the command is replying to an image
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

            const buffer = await downloadMediaMessage(
                targetMessage,
                'buffer',
                {},
                {
                    logger: console
                }
            );

            const sticker = await sharp(buffer)
                .resize(512, 512, {
                    fit: 'contain',
                    background: {
                        r: 0,
                        g: 0,
                        b: 0,
                        alpha: 0
                    }
                })
                .webp({
                    quality: 90
                })
                .toBuffer();

            await sock.sendMessage(
                from,
                {
                    sticker
                },
                { quoted: msg }
            );

        } catch (error) {
            console.error('[STICKER ERROR]', error);

            await sock.sendMessage(
                from,
                {
                    text:
                        '❌ *Failed to create the sticker.*\n\n' +
                        `Error: ${error?.message || 'Unknown error'}`
                },
                { quoted: msg }
            );
        }
    }
};
