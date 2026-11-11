'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.videoFx("slowvideo", { vf: 'setpts=2.0*PTS', af: 'atempo=0.5' }, {
    aliases: ["slowmotion"],
    description: "Slow motion video (0.5x)"
});
