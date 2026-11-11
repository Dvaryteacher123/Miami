'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.imageFx("brighten", (img, args) => img.modulate({ brightness: kit.num(args[0], 1.4, 1, 3) }), {
    aliases: ["lighten"],
    description: "Make an image brighter",
    usage: "brighten 1.4"
});
