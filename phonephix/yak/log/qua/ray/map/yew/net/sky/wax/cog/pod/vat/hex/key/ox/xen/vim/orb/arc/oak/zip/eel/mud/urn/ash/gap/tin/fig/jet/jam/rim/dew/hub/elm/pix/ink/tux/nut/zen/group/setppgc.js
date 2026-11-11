'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');
const media = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = defineGroup({
    name: 'setppgc',
    aliases: ['setgcpp', 'setgrouppic'],
    description: '🖼️ Change the group picture (reply to an image)',
    usage: 'setppgc (reply to an image)',
    admin: true,
    botAdmin: true,
    cooldown: 5,
    async run({ ctx, sock, from, reply }) {
        const found = media.findMedia(ctx, ['imageMessage']);
        if (!found) return reply('❌ Reply to an image, then type *.setppgc*');
        const buffer = await media.download(ctx, found);
        await sock.updateProfilePicture(from, buffer);
        return reply('✅ *Group picture updated.*');
    }
});
