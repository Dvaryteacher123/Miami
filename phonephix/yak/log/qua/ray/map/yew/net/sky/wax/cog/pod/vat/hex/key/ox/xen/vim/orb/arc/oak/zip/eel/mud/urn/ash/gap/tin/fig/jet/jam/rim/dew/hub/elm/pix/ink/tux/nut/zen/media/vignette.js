'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.imageFx("vignette", (img, args, meta) => {
    const w = meta.width || 512;
    const h = meta.height || 512;
    const svg = `<svg width="${w}" height="${h}"><defs><radialGradient id="g" cx="50%" cy="50%" r="75%"><stop offset="55%" stop-color="black" stop-opacity="0"/><stop offset="100%" stop-color="black" stop-opacity="0.75"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`;
    return img.composite([{ input: Buffer.from(svg), top: 0, left: 0 }]);
}, {
    aliases: ["darkedges"],
    description: "Dark vignette around the edges"
});
