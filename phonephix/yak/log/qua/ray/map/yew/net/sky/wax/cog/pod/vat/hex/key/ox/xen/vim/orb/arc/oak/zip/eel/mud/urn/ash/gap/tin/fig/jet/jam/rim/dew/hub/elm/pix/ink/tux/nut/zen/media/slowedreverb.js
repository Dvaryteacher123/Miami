'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.audioFx("slowedreverb", 'aresample=44100,asetrate=44100*0.85,aresample=44100,aecho=0.8:0.88:60|120:0.35|0.25', { aliases: ["slowrev"], description: "Slowed + reverb" });
