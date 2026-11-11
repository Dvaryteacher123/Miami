'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.imageFx("emboss", (img) => img.greyscale().convolve({ width: 3, height: 3, kernel: [-2, -1, 0, -1, 1, 1, 0, 1, 2], offset: 128 }), {
    aliases: [],
    description: "Emboss effect"
});
