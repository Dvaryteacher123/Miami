'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.videoFx("videosepia", { vf: 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131' }, {
    aliases: ["vidsepia"],
    description: "Sepia (old film) video"
});
