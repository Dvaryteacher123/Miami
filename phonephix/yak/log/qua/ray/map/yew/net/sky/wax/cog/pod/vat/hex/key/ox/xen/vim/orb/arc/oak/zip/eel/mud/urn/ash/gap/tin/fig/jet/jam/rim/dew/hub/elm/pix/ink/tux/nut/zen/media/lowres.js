'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.videoFx("lowres", { vf: 'scale=-2:320', crf: 32 }, {
    aliases: ["vidsmall","tiny"],
    description: "Shrink a video to 320p (small file)"
});
