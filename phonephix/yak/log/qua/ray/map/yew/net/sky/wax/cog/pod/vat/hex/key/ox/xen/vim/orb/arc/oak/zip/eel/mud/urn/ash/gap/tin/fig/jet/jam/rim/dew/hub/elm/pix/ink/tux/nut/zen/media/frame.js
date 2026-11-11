'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.imageFx("frame", (img, args) => { const n = Math.round(kit.num(args[0], 30, 5, 200)); return img.extend({ top: n, bottom: n, left: n, right: n, background: args[1] || '#ffffff' }); }, {
    aliases: ["border"],
    description: "Add a border around an image",
    usage: "frame 30 #ffffff"
});
