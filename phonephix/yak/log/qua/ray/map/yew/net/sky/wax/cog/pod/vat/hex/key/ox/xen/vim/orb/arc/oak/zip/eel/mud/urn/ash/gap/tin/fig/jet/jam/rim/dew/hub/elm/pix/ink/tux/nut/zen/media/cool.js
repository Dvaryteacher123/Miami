'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.imageFx("cool", (img) => img.recomb([[0.85, 0, 0], [0, 1, 0], [0, 0, 1.15]]), {
    aliases: ["coolfilter"],
    description: "Cool color filter"
});
