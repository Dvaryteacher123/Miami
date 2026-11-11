'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.videoFx("squarevideo", { vf: "crop='min(iw,ih)':'min(iw,ih)'" }, {
    aliases: ["vidsquare"],
    description: "Crop a video to a square"
});
