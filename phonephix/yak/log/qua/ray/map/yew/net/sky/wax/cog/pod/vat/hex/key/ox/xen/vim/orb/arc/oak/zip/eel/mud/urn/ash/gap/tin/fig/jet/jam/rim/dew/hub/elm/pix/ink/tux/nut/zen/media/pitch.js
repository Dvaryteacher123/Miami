'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.audioFx('pitch', (args) => {
    const semi = kit.num(args[0], 4, -12, 12);
    const f = Math.pow(2, semi / 12);
    return `aresample=44100,asetrate=44100*${f.toFixed(5)},aresample=44100,${kit.atempoChain(1 / f)}`;
}, {
    aliases: ['pitchshift'],
    description: 'Shift pitch by semitones (-12 to 12)',
    usage: 'pitch 4'
});
