'use strict';

const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = kit.videoFx("asgif", { noAudio: true, gif: true, limit: 10 }, {
    aliases: ["vid2gif","mp4togif"],
    description: "Send a video as a looping GIF"
});
