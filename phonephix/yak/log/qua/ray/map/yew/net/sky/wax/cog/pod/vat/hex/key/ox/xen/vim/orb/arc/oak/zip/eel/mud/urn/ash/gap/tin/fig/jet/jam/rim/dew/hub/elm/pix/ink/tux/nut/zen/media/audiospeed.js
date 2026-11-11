'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.audioFx('audiospeed', (args) => kit.atempoChain(kit.num(args[0], 1.25, 0.25, 4)), {
    aliases: ['atempo'],
    description: 'Change audio speed (0.25 - 4)',
    usage: 'audiospeed 1.5'
});
