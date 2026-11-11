'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.videoFx("videogray", { vf: 'hue=s=0' }, {
    aliases: ["vidbw"],
    description: "Black and white video"
});
