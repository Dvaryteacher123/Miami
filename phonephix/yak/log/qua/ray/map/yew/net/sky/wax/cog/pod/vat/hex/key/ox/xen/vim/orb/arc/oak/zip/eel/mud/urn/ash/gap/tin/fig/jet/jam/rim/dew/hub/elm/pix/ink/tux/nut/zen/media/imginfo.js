'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.defineMedia({
    name: 'imginfo',
    aliases: ['imageinfo'],
    description: 'Show size and format of an image',
    usage: 'imginfo',
    input: 'image',
    run: async ({ buffer }) => {
        const m = await require('sharp')(buffer).metadata();
        return {
            text:
                '🖼️ *IMAGE INFO*\n\n' +
                `• Format: ${m.format}\n` +
                `• Size: ${m.width} x ${m.height}\n` +
                `• File: ${(buffer.length / 1024).toFixed(1)} KB\n` +
                `• Alpha: ${m.hasAlpha ? 'yes' : 'no'}`
        };
    }
});
