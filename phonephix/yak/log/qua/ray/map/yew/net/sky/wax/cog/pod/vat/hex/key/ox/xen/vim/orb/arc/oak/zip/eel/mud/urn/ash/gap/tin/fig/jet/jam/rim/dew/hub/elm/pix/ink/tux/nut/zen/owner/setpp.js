'use strict';

const media = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/mediaKit');

module.exports = {
    name: 'setpp',
    category: 'owner',
    aliases: ['setbotpp', 'setprofilepic'],
    description: 'Set the bot account profile picture (reply to an image)',
    usage: '.setpp (reply to a picture)',
    emoji: '🖼️',
    ownerOnly: true,
    cooldown: 8,

    async execute(ctx) {
        const found = media.findMedia(ctx, ['imageMessage']);
        if (!found) return ctx.reply(`❌ Reply to a picture with ${ctx.prefix || '.'}setpp`);

        const buffer = await media.download(ctx, found);
        if (!buffer || !buffer.length) return ctx.reply('❌ Could not download that picture.');

        await ctx.sock.updateProfilePicture(ctx.sock.user.id, buffer);
        return ctx.reply('✅ Profile picture updated.');
    }
};
