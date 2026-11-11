'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.imageFx("rotate", (img, args) => img.rotate(kit.num(args[0], 90, -360, 360), { background: '#000000' }), {
    aliases: ["turn"],
    description: "Rotate an image by degrees",
    usage: "rotate 90"
});
