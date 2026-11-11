'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.imageFx("darken", (img, args) => img.modulate({ brightness: kit.num(args[0], 0.6, 0.1, 1) }), {
    aliases: ["dim"],
    description: "Make an image darker",
    usage: "darken 0.6"
});
