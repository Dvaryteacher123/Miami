'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.imageFx("pixelate", async (img, args, meta, sharp) => {
    const w = meta.width || 512;
    const h = meta.height || 512;
    const step = kit.num(args[0], 16, 4, 64);
    const small = await img.resize(Math.max(8, Math.round(w / step))).toBuffer();
    return sharp(small).resize(w, h, { kernel: 'nearest' });
}, {
    aliases: ["pixel","mosaic"],
    description: "Pixelate an image",
    usage: "pixelate 16"
});
