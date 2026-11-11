'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.videoFx("videoblur", { vf: 'boxblur=8:2' }, {
    aliases: ["vidblur"],
    description: "Blur a video"
});
