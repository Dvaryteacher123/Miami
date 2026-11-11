'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.imageFx("contrast", (img, args) => { const c = kit.num(args[0], 1.4, 0.3, 3); return img.linear(c, 128 * (1 - c)); }, {
    aliases: [],
    description: "Change the contrast",
    usage: "contrast 1.4"
});
