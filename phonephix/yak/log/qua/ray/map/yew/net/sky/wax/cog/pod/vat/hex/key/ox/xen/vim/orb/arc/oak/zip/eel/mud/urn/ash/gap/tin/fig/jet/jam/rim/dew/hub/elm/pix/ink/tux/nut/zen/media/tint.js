'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.imageFx("tint", (img, args) => img.tint(args[0] || '#ff8800'), {
    aliases: ["colorize"],
    description: "Tint an image with a color",
    usage: "tint #ff0088"
});
