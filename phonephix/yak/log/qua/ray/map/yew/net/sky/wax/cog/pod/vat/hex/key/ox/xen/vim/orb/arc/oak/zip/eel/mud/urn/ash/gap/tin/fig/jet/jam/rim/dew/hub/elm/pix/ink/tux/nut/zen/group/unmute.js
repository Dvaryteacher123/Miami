'use strict';

module.exports = {
    name: 'unmute',
    category: 'group',
    aliases: ['unsilence'],
    description: 'Unmute a group member',
    usage: '.unmute @user',
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
                return reply(
                    '❌ This command can only be used in groups.'
                );
            }

            const mentioned =
                ctx.msg?.message
                    ?.extendedTextMessage
                    ?.contextInfo
                    ?.mentionedJid || [];

            let target = mentioned[0];

            if (!target) {
                target =
                    ctx.msg?.message
                        ?.extendedTextMessage
                        ?.contextInfo
                        ?.participant;
            }

            if (!target) {
                return reply(
                    `❌ Please mention or reply to the member you want to unmute.\n\n` +
                    `Example: ${ctx.prefix || '.'}unmute @user`
                );
            }

            const cleanTarget =
                String(target).split(':')[0];

            const Setting =
                require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../database/models/Setting');

            const settings =
                await Setting.getOrCreate(
                    ctx.sessionId,
                    ctx.userId
                );

            const groupSettings =
                settings.metadata?.groups?.[ctx.from];

            if (!groupSettings) {
                return reply(
                    '❌ This member is not muted.'
                );
            }

            if (!Array.isArray(groupSettings.mutedUsers)) {
                return reply(
                    '❌ This member is not muted.'
                );
            }

            groupSettings.mutedUsers =
                groupSettings.mutedUsers.filter(
                    jid => jid !== cleanTarget
                );

            settings.markModified('metadata');

            await settings.save();

            return reply(
                `🔊 *MEMBER UNMUTED*\n\n` +
                `@${cleanTarget.split('@')[0]} can now send messages again.`,
                [cleanTarget]
            );

        } catch (error) {
            console.error('[UNMUTE ERROR]', error);

            return reply(
                `❌ Failed to unmute the member.\n\n` +
                `${error?.message || error}`
            );
        }
    }
};
