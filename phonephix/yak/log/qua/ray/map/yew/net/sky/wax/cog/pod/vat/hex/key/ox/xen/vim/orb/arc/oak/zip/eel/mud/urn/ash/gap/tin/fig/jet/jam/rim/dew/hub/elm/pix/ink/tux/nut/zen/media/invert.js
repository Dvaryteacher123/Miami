'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.imageFx("invert", (img) => img.negate({ alpha: false }), {
    aliases: ["negative"],
    description: "Invert the colors"
});
