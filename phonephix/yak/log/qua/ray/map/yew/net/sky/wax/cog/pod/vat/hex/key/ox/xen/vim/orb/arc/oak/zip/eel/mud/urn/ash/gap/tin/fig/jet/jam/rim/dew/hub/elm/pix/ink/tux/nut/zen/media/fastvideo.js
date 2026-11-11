'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.videoFx("fastvideo", { vf: 'setpts=0.5*PTS', af: 'atempo=2.0' }, {
    aliases: ["timelapse"],
    description: "Fast video (2x)"
});
