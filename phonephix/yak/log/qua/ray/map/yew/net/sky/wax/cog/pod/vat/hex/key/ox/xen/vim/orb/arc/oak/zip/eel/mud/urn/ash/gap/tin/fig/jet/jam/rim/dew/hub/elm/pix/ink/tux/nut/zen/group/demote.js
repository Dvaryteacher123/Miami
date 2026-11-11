'use strict';

module.exports = {
    name: 'demote',
    category: 'group',

    aliases: ['removeadmin'],

    description: 'Remove admin status from a group member',
    usage: '.demote @user',

    ownerOnly: false,
    cooldown: 5,

    async execute(ctx) {

        const reply = async (text) => {
            await ctx.sock.sendMessage(
                ctx.from,
                {
                    text: String(text)
                },
                {
                    quoted: ctx.msg
                }
            );
        };

        try {

            /*
            |--------------------------------------------------------------------------
            | GROUP CHECK
            |--------------------------------------------------------------------------
            */

            if (!ctx.isGroup) {
                return reply(
                    '❌ This command can only be used in groups.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | FIND TARGET
            |--------------------------------------------------------------------------
            */

            let target =
                ctx.msg?.message
                    ?.extendedTextMessage
                    ?.contextInfo
                    ?.mentionedJid?.[0];

            /*
            |--------------------------------------------------------------------------
            | REPLY TARGET
            |--------------------------------------------------------------------------
            */

            if (!target) {
                target =
                    ctx.msg?.message
                        ?.extendedTextMessage
                        ?.contextInfo
                        ?.participant;
            }

            /*
            |--------------------------------------------------------------------------
            | NO TARGET
            |--------------------------------------------------------------------------
            */

            if (!target) {
                return reply(
                    '❌ Mention or reply to the admin you want to demote.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | DEMOTE
            |--------------------------------------------------------------------------
            */

            await ctx.sock.groupParticipantsUpdate(
                ctx.from,
                [target],
                'demote'
            );

            /*
            |--------------------------------------------------------------------------
            | DISPLAY NUMBER
            |--------------------------------------------------------------------------
            */

            const number =
                String(target)
                    .split(':')[0]
                    .split('@')[0];

            /*
            |--------------------------------------------------------------------------
            | SUCCESS
            |--------------------------------------------------------------------------
            */

            return reply(
                `✅ @${number} has been removed from group admin.`
            );

        } catch (error) {

            console.error(
                '[DEMOTE ERROR]',
                error
            );

            return reply(
                `❌ Failed to demote member.\n\n` +
                `${error?.message || error}`
            );
        }
    }
};
