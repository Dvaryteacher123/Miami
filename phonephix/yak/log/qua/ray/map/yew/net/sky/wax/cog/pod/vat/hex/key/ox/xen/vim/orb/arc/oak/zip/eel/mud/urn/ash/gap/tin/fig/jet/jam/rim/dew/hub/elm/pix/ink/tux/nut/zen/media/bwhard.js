'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.imageFx("bwhard", (img, args) => img.greyscale().threshold(Math.round(kit.num(args[0], 128, 1, 254))), {
    aliases: ["threshold"],
    description: "Pure black & white (threshold)",
    usage: "bwhard 128"
});
