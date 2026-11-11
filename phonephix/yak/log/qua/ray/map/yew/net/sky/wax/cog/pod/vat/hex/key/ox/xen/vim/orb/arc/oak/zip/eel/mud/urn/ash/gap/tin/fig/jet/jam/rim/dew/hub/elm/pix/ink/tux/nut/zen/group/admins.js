'use strict';

module.exports = {
    name: 'admins',
    category: 'group',
    aliases: ['adminlist'],
    description: 'Show group administrators',
    usage: '.admins',
    ownerOnly: false,
    cooldown: 5,

    async execute(ctx) {
        const reply = async (text, mentions = []) => {
            await ctx.sock.sendMessage(
                ctx.from,
                {
                    text: String(text),
                    mentions
                },
                { quoted: ctx.msg }
            );
        };

        try {
            if (!ctx.isGroup) {
                return reply('❌ This command can only be used in groups.');
            }

            const metadata = await ctx.sock.groupMetadata(ctx.from);

            const admins = (metadata.participants || []).filter(
                p => p.admin === 'admin' || p.admin === 'superadmin'
            );

            if (!admins.length) {
                return reply('❌ No admins found.');
            }

            let text = `👑 *GROUP ADMINS*\n\n`;

            const mentions = [];

            admins.forEach((admin, index) => {
                const jid = admin.id;
                const number = jid
                    .split(':')[0]
                    .split('@')[0];

                mentions.push(jid);

                text += `${index + 1}. @${number}`;

                if (admin.admin === 'superadmin') {
                    text += ` 👑`;
                }

                text += `\n`;
            });

            text += `\n📊 Total Admins: *${admins.length}*`;

            return reply(text, mentions);

        } catch (error) {
            console.error('[ADMINS ERROR]', error);

            return reply(
                `❌ Failed to fetch admins.\n\n${error?.message || error}`
            );
        }
    }
};
