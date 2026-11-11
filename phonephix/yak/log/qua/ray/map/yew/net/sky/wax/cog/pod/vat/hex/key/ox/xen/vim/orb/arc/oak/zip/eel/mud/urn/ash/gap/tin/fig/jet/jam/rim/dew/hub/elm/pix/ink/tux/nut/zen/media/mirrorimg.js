'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.imageFx("mirrorimg", async (img, args, meta, sharp) => {
    const half = Math.floor((meta.width || 2) / 2);
    const h = meta.height;
    const left = await img.clone().extract({ left: 0, top: 0, width: half, height: h }).toBuffer();
    const right = await sharp(left).flop().toBuffer();
    return sharp(left).extend({ right: half, background: '#000000' }).composite([{ input: right, left: half, top: 0 }]);
}, {
    aliases: ["symmetry"],
    description: "Mirror the left half onto the right"
});
