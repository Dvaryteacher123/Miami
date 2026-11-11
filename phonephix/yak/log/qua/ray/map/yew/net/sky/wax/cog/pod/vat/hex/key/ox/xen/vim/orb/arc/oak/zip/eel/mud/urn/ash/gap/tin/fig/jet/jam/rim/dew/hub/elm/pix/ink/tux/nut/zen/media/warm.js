'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.imageFx("warm", (img) => img.recomb([[1.15, 0, 0], [0, 1, 0], [0, 0, 0.85]]), {
    aliases: ["warmfilter"],
    description: "Warm color filter"
});
