'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.defineMedia({
    name: 'trimaudio',
    aliases: ['cutaudio', 'atrim'],
    description: 'Cut a part of an audio (start seconds, length seconds)',
    usage: 'trimaudio 10 30',
    input: 'audio',
    run: async ({ buffer, args }) => {
        const start = kit.num(args[0], 0, 0, 36000);
        const len = kit.num(args[1], 30, 1, 600);
        const out = await kit.runFfmpeg(buffer, {
            outExt: 'mp3',
            pre: ['-ss', String(start), '-t', String(len)],
            args: ['-vn', '-c:a', 'libmp3lame', '-b:a', '128k']
        });
        return { audio: out };
    }
});
