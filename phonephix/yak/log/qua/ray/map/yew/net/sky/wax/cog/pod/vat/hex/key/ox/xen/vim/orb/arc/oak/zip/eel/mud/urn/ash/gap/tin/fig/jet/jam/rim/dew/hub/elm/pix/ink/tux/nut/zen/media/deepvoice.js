'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.audioFx("deepvoice", 'aresample=44100,asetrate=44100*0.8,aresample=44100,atempo=1.25', { aliases: ["deep"], description: "Make a voice deeper" });
