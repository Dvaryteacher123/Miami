'use strict';

module.exports = {
    name: 'setbotname',
    category: 'owner',
    aliases: ['setprofilename', 'botname'],
    description: 'Change the WhatsApp profile name of this account',
    usage: '.setbotname <name>',
    emoji: '🏷️',
    ownerOnly: true,
    cooldown: 5,

    async execute(ctx) {
        const name = (ctx.args || []).join(' ').trim();
        if (!name) return ctx.reply(`❌ Usage: ${ctx.prefix || '.'}setbotname <new name>`);
        if (name.length > 25) return ctx.reply('❌ The name can be 25 characters at most.');
        await ctx.sock.updateProfileName(name);
        return ctx.reply(`✅ Profile name changed to *${name}*`);
    }
};
