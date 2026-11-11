'use strict';

module.exports = {
    name: 'promote',
    category: 'group',

    aliases: ['admin'],

    description: 'Promote a member to group admin',
    usage: '.promote @user',

    ownerOnly: false,
    cooldown: 5,

    async execute(ctx) {

        const reply = async (text) => {
            await ctx.sock.sendMessage(
                ctx.from,
                { text: String(text) },
                { quoted: ctx.msg }
            );
        };

        try {
            if (!ctx.isGroup) {
                return reply(
                    '❌ This command can only be used in groups.'
                );
            }

            let target =
                ctx.msg?.message
                    ?.extendedTextMessage
                    ?.contextInfo
                    ?.mentionedJid?.[0];

            if (!target) {
                target =
                    ctx.msg?.message
                        ?.extendedTextMessage
                        ?.contextInfo
                        ?.participant;
            }

            if (!target) {
                return reply(
                    '❌ Mention or reply to the member you want to promote.'
                );
            }

            await ctx.sock.groupParticipantsUpdate(
                ctx.from,
                [target],
                'promote'
            );

            const number =
                String(target)
                    .split(':')[0]
                    .split('@')[0];

            return reply(
                `✅ @${number} has been promoted to admin.`
            );

        } catch (error) {
            console.error('[PROMOTE ERROR]', error);

            return reply(
                `❌ Failed to promote member.\n\n${error.message}`
            );
        }
    }
};
