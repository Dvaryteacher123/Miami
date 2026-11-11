'use strict';

const codeOf = (s) => {
    const m = String(s || '').match(/channel\/([A-Za-z0-9_-]{10,})/i) || String(s || '').match(/^([A-Za-z0-9_-]{16,})$/);
    return m ? m[1] : '';
};

module.exports = {
    name: 'channelid',
    category: 'utility',
    aliases: ['cid', 'newsletterid'],
    description: 'Get the ID (JID) of a WhatsApp channel from its link',
    usage: '.channelid <channel link>',
    emoji: '📣',
    cooldown: 5,

    async execute(ctx) {
        const code = codeOf((ctx.args || [])[0]);
        if (!code) return ctx.reply(`❌ Usage: ${ctx.prefix || '.'}channelid https://whatsapp.com/channel/XXXX`);

        const meta = await ctx.sock.newsletterMetadata('invite', code);
        if (!meta || !meta.id) return ctx.reply('❌ Channel not found.');
        return ctx.reply(`📣 *CHANNEL ID*\n\n${meta.id}\n\n📛 ${meta.name || ''}`);
    }
};
