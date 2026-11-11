'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'getgpp',
    aliases: ['gcpp', 'grouppic'],
    description: '🖼️ Send the group picture',
    cooldown: 5,
    async run({ sock, from, meta, send, reply }) {
        let url = null;
        try { url = await sock.profilePictureUrl(from, 'image'); } catch (_) { /* no picture */ }
        if (!url) return reply('❌ This group has no picture.');
        return send({ image: { url }, caption: `🖼️ ${meta.subject}` });
    }
});
