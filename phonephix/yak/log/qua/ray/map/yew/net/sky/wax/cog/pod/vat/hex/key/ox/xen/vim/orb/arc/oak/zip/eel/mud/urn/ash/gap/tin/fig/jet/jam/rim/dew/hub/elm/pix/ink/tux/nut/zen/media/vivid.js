'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.imageFx("vivid", (img, args) => img.modulate({ saturation: kit.num(args[0], 1.8, 1, 4) }), {
    aliases: ["saturate"],
    description: "Boost the colors",
    usage: "vivid 1.8"
});
