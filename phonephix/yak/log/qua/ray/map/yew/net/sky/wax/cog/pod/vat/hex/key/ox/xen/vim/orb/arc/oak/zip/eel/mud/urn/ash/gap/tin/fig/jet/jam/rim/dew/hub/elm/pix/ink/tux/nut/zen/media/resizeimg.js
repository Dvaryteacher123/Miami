'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.imageFx("resizeimg", (img, args) => img.resize(Math.round(kit.num(args[0], 512, 16, 4000)), args[1] ? Math.round(kit.num(args[1], 512, 16, 4000)) : null), {
    aliases: ["imgresize"],
    description: "Resize an image (width, optional height)",
    usage: "resizeimg 512"
});
