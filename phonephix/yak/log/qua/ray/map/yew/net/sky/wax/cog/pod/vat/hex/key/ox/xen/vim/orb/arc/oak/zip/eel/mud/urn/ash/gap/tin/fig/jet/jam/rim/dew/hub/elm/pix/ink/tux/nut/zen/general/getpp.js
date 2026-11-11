'use strict';

module.exports = {
    name: 'getpp',

    category: 'general',

    aliases: [
        'pp',
        'profilepic',
        'dp'
    ],

    description: 'Get profile picture of a user or group',

    usage: '.getpp',

    ownerOnly: false,

    cooldown: 5,

    async execute(ctx) {

        try {

            const {
                sock,
                from,
                msg,
                isGroup
            } = ctx;

            if (!sock) {
                return;
            }

            /*
            |--------------------------------------------------------------------------
            | FIND TARGET
            |--------------------------------------------------------------------------
            */

            let target = from;

            /*
            | Kama mtu amemention user:
            | .getpp @2557xxxx
            */

            const mentioned =
                msg?.message?.extendedTextMessage
                    ?.contextInfo
                    ?.mentionedJid;

            if (
                Array.isArray(mentioned) &&
                mentioned.length > 0
            ) {
                target = mentioned[0];
            }

            /*
            | Kama command imereply message
            */

            const quoted =
                msg?.message
                    ?.extendedTextMessage
                    ?.contextInfo
                    ?.participant;

            if (
                !mentioned?.length &&
                quoted
            ) {
                target = quoted;
            }

            /*
            |--------------------------------------------------------------------------
            | GET PROFILE PICTURE
            |--------------------------------------------------------------------------
            */

            let profileUrl;

            try {

                profileUrl =
                    await sock.profilePictureUrl(
                        target,
                        'image'
                    );

            } catch (error) {

                profileUrl = null;
            }

            /*
            |--------------------------------------------------------------------------
            | NO PROFILE PICTURE
            |--------------------------------------------------------------------------
            */

            if (!profileUrl) {

                await sock.sendMessage(
                    from,
                    {
                        text:
                            `❌ *No profile picture found.*\n\n` +
                            `👤 User: @${String(target)
                                .split('@')[0]
                                .split(':')[0]}`,
                        mentions: [target]
                    },
                    {
                        quoted: msg
                    }
                );

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | SEND PROFILE PICTURE
            |--------------------------------------------------------------------------
            */

            await sock.sendMessage(
                from,
                {
                    image: {
                        url: profileUrl
                    },

                    caption:
                        `🖼️ *PROFILE PICTURE*\n\n` +
                        `👤 User: @${String(target)
                            .split('@')[0]
                            .split(':')[0]}\n\n` +
                        `🤖 *PHONEPHIX BOT*`,

                    mentions: [target]
                },
                {
                    quoted: msg
                }
            );

        } catch (error) {

            console.error(
                '[GETPP COMMAND ERROR]',
                error
            );

            try {

                await ctx.sock.sendMessage(
                    ctx.from,
                    {
                        text:
                            `❌ Failed to get profile picture.\n\n` +
                            `${error?.message || error}`
                    },
                    {
                        quoted: ctx.msg
                    }
                );

            } catch (_) {}
        }
    }
};
