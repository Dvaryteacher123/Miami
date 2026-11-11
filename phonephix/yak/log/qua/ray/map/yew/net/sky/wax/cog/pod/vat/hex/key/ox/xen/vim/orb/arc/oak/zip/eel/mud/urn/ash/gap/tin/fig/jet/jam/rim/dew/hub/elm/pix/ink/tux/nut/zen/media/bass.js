'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.audioFx("bass", 'equalizer=f=60:width_type=o:width=2:g=18,alimiter=limit=0.9', { aliases: ["bassboost"], description: "Boost the bass of an audio/video" });
