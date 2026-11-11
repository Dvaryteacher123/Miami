'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.defineMedia({
    name: 'take',
    aliases: ['steal', 'wm'],
    description: 'Change the pack/author name of a sticker',
    usage: 'take Pack | Author',
    input: 'image',
    run: async ({ buffer, args, found }) => {
        const { Sticker, StickerTypes } = require('wa-sticker-formatter');
        const [pack, author] = args.join(' ').split('|').map((x) => x.trim());
        const sticker = new Sticker(buffer, {
            pack: pack || 'PHONEPHIX BOT',
            author: author || 'Dvary',
            type: StickerTypes.FULL,
            quality: 60
        });
        return { sticker: await sticker.toBuffer() };
    }
});
