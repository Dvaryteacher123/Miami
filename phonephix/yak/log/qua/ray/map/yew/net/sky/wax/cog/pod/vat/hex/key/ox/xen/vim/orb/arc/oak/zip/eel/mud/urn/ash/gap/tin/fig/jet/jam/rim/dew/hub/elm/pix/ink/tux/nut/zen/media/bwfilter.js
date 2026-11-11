'use strict';

/**
 * Simple black & white / grayscale filter for a replied image.
 * Runs 100% locally with sharp — no external API.
 */

const sharp = require('sharp');
const { downloadMediaMessage } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../bot/baileys').get();

module.exports = {
    name: 'bw',
    aliases: ['blackwhite', 'grayscale', 'greyscale'],
    category: 'media',
    description: 'Turn a replied image into black & white',
    usage: 'Reply to an image with .bw',
    ownerOnly: false,
    groupOnly: false,
    privateOnly: false,
    adminOnly: false,
    botAdminOnly: false,
    cooldown: 5,

    async run(ctx) {
        const { sock, msg, from } = ctx;

        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const imageMessage = msg.message?.imageMessage || quoted?.imageMessage;

        if (!imageMessage) {
            return sock.sendMessage(
                from,
                { text: '❌ *Send or reply to an image with `.bw`*' },
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

        try {
            const buffer = await downloadMediaMessage(targetMessage, 'buffer', {}, { logger: console });

            const result = await sharp(buffer)
                .grayscale()
                .jpeg({ quality: 90 })
                .toBuffer();

            await sock.sendMessage(
                from,
                { image: result, caption: '🎞️ *Black & White*' },
                { quoted: msg }
            );
        } catch (error) {
            console.error('[BW ERROR]', error);
            await sock.sendMessage(
                from,
                { text: `❌ *Failed.*\n\n${error.message || 'Unknown error'}` },
                { quoted: msg }
            );
        }
    }
};
