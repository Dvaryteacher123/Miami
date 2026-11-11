'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.videoFx("boomerang", { filterComplex: '[0:v]scale=trunc(iw/2)*2:trunc(ih/2)*2,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1:a=0[v]', map: ['-map', '[v]'], noAudio: true, limit: 5 }, {
    aliases: ["bounce"],
    description: "Boomerang loop (forward + backward)"
});
