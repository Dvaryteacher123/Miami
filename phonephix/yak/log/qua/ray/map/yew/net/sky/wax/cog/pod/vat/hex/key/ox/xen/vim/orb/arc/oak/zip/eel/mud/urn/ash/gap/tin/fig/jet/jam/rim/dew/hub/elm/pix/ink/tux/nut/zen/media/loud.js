'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.audioFx('loud', (args) => `volume=${kit.num(args[0], 2, 0.2, 4)},alimiter=limit=0.95`, {
    aliases: ['setvol', 'volume'],
    description: 'Change the volume (0.2 - 4)',
    usage: 'loud 2'
});
