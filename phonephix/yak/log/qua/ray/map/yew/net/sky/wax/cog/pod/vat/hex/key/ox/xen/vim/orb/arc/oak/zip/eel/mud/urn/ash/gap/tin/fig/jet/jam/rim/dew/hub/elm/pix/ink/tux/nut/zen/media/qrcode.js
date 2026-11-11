'use strict';

/**
 * Generates a QR code image locally — no external API, so it's instant
 * and never fails from network issues.
 */

const QRCode = require('qrcode');

module.exports = {
    name: 'qrcode',
    aliases: ['qr'],
    category: 'media',
    description: 'Generate a QR code from text or a link',
    usage: '.qrcode <text or link>',
    ownerOnly: false,
    groupOnly: false,
    privateOnly: false,
    adminOnly: false,
    botAdminOnly: false,
    cooldown: 3,

    async run(ctx) {
        const { sock, msg, from, args } = ctx;
        const text = (args || []).join(' ').trim();

        if (!text) {
            return sock.sendMessage(
                from,
                { text: '❌ *Send text or a link to turn into a QR code.*\n\nExample:\n.qrcode https://wa.me/255700000000' },
                { quoted: msg }
            );
        }

        try {
            const buffer = await QRCode.toBuffer(text, {
                type: 'png',
                width: 512,
                margin: 2
            });

            await sock.sendMessage(
                from,
                { image: buffer, caption: `📱 *QR Code*\n\n${text.length > 80 ? text.slice(0, 80) + '...' : text}` },
                { quoted: msg }
            );
        } catch (error) {
            console.error('[QRCODE ERROR]', error);
            await sock.sendMessage(
                from,
                { text: `❌ *Failed to generate QR code.*\n\n${error.message || 'Unknown error'}` },
                { quoted: msg }
            );
        }
    }
};
