'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.videoFx("videospeed", (args) => { const x = kit.num(args[0], 1.5, 0.25, 4); return { vf: `setpts=${(1 / x).toFixed(4)}*PTS`, af: kit.atempoChain(x) }; }, {
    aliases: ["vspeed"],
    description: "Change video speed (0.25 - 4)",
    usage: "videospeed 1.5"
});
