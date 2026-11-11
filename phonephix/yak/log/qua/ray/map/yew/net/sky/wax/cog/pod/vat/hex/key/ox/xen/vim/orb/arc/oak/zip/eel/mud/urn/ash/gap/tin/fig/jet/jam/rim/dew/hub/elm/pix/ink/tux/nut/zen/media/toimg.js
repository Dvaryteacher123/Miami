'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.defineMedia({
    name: 'toimg',
    aliases: ['stickertoimg', 'unsticker'],
    description: 'Convert a sticker into an image',
    usage: 'toimg',
    input: 'sticker',
    run: async ({ buffer }) => ({ image: await require('sharp')(buffer).png().toBuffer() })
});
