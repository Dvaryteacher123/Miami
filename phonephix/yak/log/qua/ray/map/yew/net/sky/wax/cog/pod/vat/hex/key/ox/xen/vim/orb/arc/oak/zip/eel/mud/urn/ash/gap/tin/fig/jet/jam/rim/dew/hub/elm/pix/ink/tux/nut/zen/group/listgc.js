'use strict';

module.exports = {
    name: 'listgc',
    category: 'group',
    aliases: ['mygroups', 'groups', 'gclist'],
    description: 'List all groups the bot is in, with their IDs',
    usage: '.listgc',
    emoji: '📋',
    ownerOnly: true,
    cooldown: 10,

    async execute(ctx) {
        const all = await ctx.sock.groupFetchAllParticipating();
        const groups = Object.values(all || {}).sort((a, b) => String(a.subject).localeCompare(String(b.subject)));
        if (!groups.length) return ctx.reply('ℹ️ This account is not in any group.');

        const rows = groups.map((g, i) =>
            `${i + 1}. *${g.subject || 'Unnamed'}*\n   👥 ${(g.participants || []).length}  🆔 ${g.id}`);

        // WhatsApp messages have a size limit: send in chunks
        const chunks = [];
        let cur = `📋 *MY GROUPS (${groups.length})*\n\n`;
        for (const r of rows) {
            if ((cur + r).length > 3000) { chunks.push(cur); cur = ''; }
            cur += r + '\n\n';
        }
        if (cur.trim()) chunks.push(cur);

        for (const c of chunks) await ctx.reply(c.trimEnd());
    }
};
