'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.imageFx("sharpen", (img) => img.sharpen({ sigma: 2 }), {
    aliases: ["crisp"],
    description: "Sharpen an image"
});
