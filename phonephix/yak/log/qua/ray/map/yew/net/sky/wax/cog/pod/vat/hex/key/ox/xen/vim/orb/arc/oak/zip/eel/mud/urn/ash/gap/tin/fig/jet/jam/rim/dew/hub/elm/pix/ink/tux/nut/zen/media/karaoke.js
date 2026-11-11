'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.audioFx("karaoke", 'aformat=channel_layouts=stereo,pan=stereo|c0=c0-c1|c1=c1-c0', { aliases: ["novocal"], description: "Try to remove the vocals" });
