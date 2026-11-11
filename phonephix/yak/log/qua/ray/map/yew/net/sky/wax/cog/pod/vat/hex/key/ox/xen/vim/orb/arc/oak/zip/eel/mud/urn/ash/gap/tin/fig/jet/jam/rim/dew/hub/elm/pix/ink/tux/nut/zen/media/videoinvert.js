'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.videoFx("videoinvert", { vf: 'negate' }, {
    aliases: ["vidneg"],
    description: "Invert the colors of a video"
});
