'use strict';

const codeOf = (s) => {
    const m = String(s || '').match(/channel\/([A-Za-z0-9_-]{10,})/i) || String(s || '').match(/^([A-Za-z0-9_-]{16,})$/);
    return m ? m[1] : '';
};

module.exports = {
    name: 'chinfo',
    category: 'utility',
    aliases: ['channelinfo', 'newsletterinfo'],
    description: 'Show details of a WhatsApp channel (name, followers, ID)',
    usage: '.chinfo <channel link>',
    emoji: 'ℹ️',
    cooldown: 5,

    async execute(ctx) {
        const code = codeOf((ctx.args || [])[0]);
        if (!code) return ctx.reply(`❌ Usage: ${ctx.prefix || '.'}chinfo https://whatsapp.com/channel/XXXX`);

        const m = await ctx.sock.newsletterMetadata('invite', code);
        if (!m || !m.id) return ctx.reply('❌ Channel not found.');

        const created = m.creation_time ? new Date(Number(m.creation_time) * 1000).toISOString().slice(0, 10) : '-';
        const subs = m.subscribers !== undefined ? Number(m.subscribers).toLocaleString('en-US') : '-';
        const desc = String(m.description || '').slice(0, 400);

        return ctx.reply(
            `📣 *CHANNEL INFO*\n\n` +
            `📛 Name: ${m.name || '-'}\n` +
            `👥 Followers: ${subs}\n` +
            `✅ Verified: ${m.verification === 'VERIFIED' ? 'Yes' : 'No'}\n` +
            `📅 Created: ${created}\n` +
            `🆔 ID: ${m.id}\n` +
            (desc ? `\n📝 ${desc}` : '')
        );
    }
};
