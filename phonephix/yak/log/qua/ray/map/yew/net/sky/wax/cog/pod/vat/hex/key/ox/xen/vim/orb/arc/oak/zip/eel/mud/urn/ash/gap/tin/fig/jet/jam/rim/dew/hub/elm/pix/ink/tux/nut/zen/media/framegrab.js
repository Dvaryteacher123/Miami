'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.defineMedia({
    name: 'framegrab',
    aliases: ['vidthumb', 'screenshot'],
    description: 'Get a picture from a video (optional second)',
    usage: 'framegrab 3',
    input: 'video',
    run: async ({ buffer, args }) => {
        const out = await kit.runFfmpeg(buffer, {
            inExt: 'mp4',
            outExt: 'jpg',
            pre: ['-ss', String(kit.num(args[0], 0, 0, 36000))],
            args: ['-frames:v', '1', '-q:v', '2']
        });
        return { image: out };
    }
});
