'use strict';

module.exports = {
    name: 'blocklist',
    category: 'owner',
    aliases: ['blocked', 'listblocked'],
    description: 'Show the numbers blocked by this account',
    usage: '.blocklist',
    emoji: '⛔',
    ownerOnly: true,
    cooldown: 5,

    async execute(ctx) {
        const list = (await ctx.sock.fetchBlocklist()) || [];
        if (!list.length) return ctx.reply('✅ You have not blocked anyone.');

        const rows = list.slice(0, 100).map((j, i) => `${i + 1}. +${String(j).split('@')[0]}`);
        return ctx.reply(
            `⛔ *BLOCKED (${list.length})*\n\n${rows.join('\n')}` +
            (list.length > 100 ? `\n\n…and ${list.length - 100} more` : '') +
            `\n\nUnblock with ${ctx.prefix || '.'}unblock <number>`
        );
    }
};
