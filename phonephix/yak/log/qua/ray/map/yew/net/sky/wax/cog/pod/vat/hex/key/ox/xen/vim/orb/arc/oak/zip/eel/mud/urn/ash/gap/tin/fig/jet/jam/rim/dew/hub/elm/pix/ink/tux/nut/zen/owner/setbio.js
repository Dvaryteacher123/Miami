'use strict';

module.exports = {
    name: 'setbio',
    category: 'owner',
    aliases: ['setabout', 'setstatustext'],
    description: 'Change the bot account About / bio text',
    usage: '.setbio <text>',
    emoji: '✍️',
    ownerOnly: true,
    cooldown: 5,

    async execute(ctx) {
        const text = (ctx.args || []).join(' ').trim();
        if (!text) return ctx.reply(`❌ Usage: ${ctx.prefix || '.'}setbio <new about text>`);
        if (text.length > 139) return ctx.reply('❌ The About text can be 139 characters at most.');
        await ctx.sock.updateProfileStatus(text);
        return ctx.reply(`✅ About updated:\n\n${text}`);
    }
};
