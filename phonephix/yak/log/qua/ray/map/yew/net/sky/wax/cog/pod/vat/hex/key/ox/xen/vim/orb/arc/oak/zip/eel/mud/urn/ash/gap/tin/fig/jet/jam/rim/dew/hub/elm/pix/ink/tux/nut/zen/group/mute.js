'use strict';

module.exports = {
    name: 'mute',
    category: 'group',
    aliases: ['silence'],
    description: 'Mute a group member',
    usage: '.mute @user',
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

            // Also support replying to a message
            if (!target) {
                target =
                    ctx.msg?.message
                        ?.extendedTextMessage
                        ?.contextInfo
                        ?.participant;
            }

            if (!target) {
                return reply(
                    `❌ Please mention or reply to the member you want to mute.\n\n` +
                    `Example: ${ctx.prefix || '.'}mute @user`
                );
            }

            const Setting =
                require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../database/models/Setting');

            const settings =
                await Setting.getOrCreate(
                    ctx.sessionId,
                    ctx.userId
                );

            if (!settings.metadata) {
                settings.metadata = {};
            }

            if (!settings.metadata.groups) {
                settings.metadata.groups = {};
            }

            if (!settings.metadata.groups[ctx.from]) {
                settings.metadata.groups[ctx.from] = {};
            }

            const groupSettings =
                settings.metadata.groups[ctx.from];

            if (!Array.isArray(groupSettings.mutedUsers)) {
                groupSettings.mutedUsers = [];
            }

            // Normalize JID
            const cleanTarget =
                String(target).split(':')[0];

            // Avoid duplicates
            if (!groupSettings.mutedUsers.includes(cleanTarget)) {
                groupSettings.mutedUsers.push(cleanTarget);
            }

            settings.markModified('metadata');

            await settings.save();

            return reply(
                `🔇 *MEMBER MUTED*\n\n` +
                `@${cleanTarget.split('@')[0]} has been muted.\n\n` +
                `Their messages will be automatically deleted.`,
                [cleanTarget]
            );

        } catch (error) {
            console.error('[MUTE ERROR]', error);

            return reply(
                `❌ Failed to mute the member.\n\n` +
                `${error?.message || error}`
            );
        }
    }
};
