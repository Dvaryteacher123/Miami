'use strict';

const http = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/http');

module.exports = {
    name: 'github',
    category: 'utility',
    aliases: ['gh', 'ghuser'],
    description: 'Show a GitHub user profile',
    usage: '.github <username>',
    emoji: '🐙',
    cooldown: 5,

    async execute(ctx) {
        const user = ((ctx.args || [])[0] || '').replace(/^@/, '');
        if (!/^[A-Za-z0-9-]{1,39}$/.test(user)) return ctx.reply(`❌ Usage: ${ctx.prefix || '.'}github torvalds`);

        const d = await http.get(`https://api.github.com/users/${user}`, { headers: { Accept: 'application/vnd.github+json' } });
        const text =
            `🐙 *${d.name || d.login}* (@${d.login})\n\n` +
            (d.bio ? `📝 ${d.bio}\n\n` : '') +
            `📦 Repos: ${d.public_repos}\n👥 Followers: ${d.followers}  ➡️ Following: ${d.following}\n` +
            (d.location ? `📍 ${d.location}\n` : '') +
            (d.company ? `🏢 ${d.company}\n` : '') +
            `📅 Joined: ${String(d.created_at).slice(0, 10)}\n🔗 ${d.html_url}`;

        if (d.avatar_url) {
            try {
                const img = await http.get(d.avatar_url, { responseType: 'arraybuffer' });
                return await ctx.sock.sendMessage(ctx.from, { image: Buffer.from(img), caption: text }, { quoted: ctx.msg });
            } catch (_) {}
        }
        return ctx.reply(text);
    }
};
