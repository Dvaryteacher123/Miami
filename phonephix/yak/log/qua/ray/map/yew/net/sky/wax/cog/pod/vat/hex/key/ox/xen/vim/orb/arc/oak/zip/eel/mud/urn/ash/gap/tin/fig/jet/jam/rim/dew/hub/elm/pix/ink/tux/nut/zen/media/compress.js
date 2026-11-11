'use strict';

/**
 * Compresses a replied image so it's lighter to send/forward.
 * Runs 100% locally with sharp — no external API.
 */

const sharp = require('sharp');
const { downloadMediaMessage } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../bot/baileys').get();

module.exports = {
    name: 'compress',
    aliases: ['compressimg', 'shrink'],
    category: 'media',
    description: 'Compress a replied image to reduce its file size',
    usage: 'Reply to an image with .compress',
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
                { text: '❌ *Send or reply to an image with `.compress`*' },
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
            const beforeKb = (buffer.length / 1024).toFixed(0);

            const compressed = await sharp(buffer)
                .resize({ width: 1280, withoutEnlargement: true })
                .jpeg({ quality: 55, mozjpeg: true })
                .toBuffer();

            const afterKb = (compressed.length / 1024).toFixed(0);

            await sock.sendMessage(
                from,
                { image: compressed, caption: `🗜️ *Compressed*\n${beforeKb}KB → ${afterKb}KB` },
                { quoted: msg }
            );
        } catch (error) {
            console.error('[COMPRESS ERROR]', error);
            await sock.sendMessage(
                from,
                { text: `❌ *Failed to compress image.*\n\n${error.message || 'Unknown error'}` },
                { quoted: msg }
            );
        }
    }
};
