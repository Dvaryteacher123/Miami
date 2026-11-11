'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.videoFx('trimvideo', (args) => ({
    pre: ['-ss', String(kit.num(args[0], 0, 0, 36000))],
    limit: kit.num(args[1], 15, 1, 120)
}), {
    aliases: ['cutvideo', 'vtrim'],
    description: 'Cut a part of a video (start seconds, length seconds)',
    usage: 'trimvideo 5 15'
});
