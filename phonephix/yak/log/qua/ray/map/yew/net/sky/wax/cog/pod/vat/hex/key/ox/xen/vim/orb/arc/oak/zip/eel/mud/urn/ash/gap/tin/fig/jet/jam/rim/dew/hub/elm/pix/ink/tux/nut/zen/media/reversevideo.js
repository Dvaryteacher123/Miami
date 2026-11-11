'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.videoFx("reversevideo", { vf: 'reverse', af: 'areverse', limit: 20 }, {
    aliases: ["revvideo","rewind"],
    description: "Play a video backwards (max 20s)"
});
