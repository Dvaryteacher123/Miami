'use strict';

const Setting = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../database/models/Setting');

module.exports = {
    name: 'mode',

    aliases: [
        'botmode'
    ],

    category: 'general',

    description:
        'Change the bot between public and private mode',

    usage:
        '.mode public\n' +
        '.mode private\n' +
        '.mode status',

    ownerOnly: false,

    cooldown: 3,


    async execute(ctx) {

        /*
        |--------------------------------------------------------------------------
        | REPLY HELPER
        |--------------------------------------------------------------------------
        */

        const reply = async (text) => {

            try {

                return await ctx.sock.sendMessage(
                    ctx.from,
                    {
                        text: String(text)
                    },
                    {
                        quoted: ctx.msg
                    }
                );

            } catch (error) {

                console.error(
                    '[MODE REPLY ERROR]',
                    error
                );
            }
        };


        /*
        |--------------------------------------------------------------------------
        | SESSION OWNER ONLY
        |--------------------------------------------------------------------------
        |
        | Mode inaweza kubadilishwa na aliyepair
        | session hii tu.
        |
        */

        if (!ctx.isSessionOwner) {

            return reply(
                '❌ *Access Denied*\n\n' +
                '👑 Only the person who paired this bot session can change the mode.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | ARGUMENT
        |--------------------------------------------------------------------------
        */

        const action =
            String(
                ctx.args?.[0] || ''
            )
            .toLowerCase()
            .trim();


        /*
        |--------------------------------------------------------------------------
        | CURRENT MODE
        |--------------------------------------------------------------------------
        */

        let currentMode =
            String(
                ctx.settings?.mode ||
                'public'
            )
            .toLowerCase();


        /*
        |--------------------------------------------------------------------------
        | STATUS
        |--------------------------------------------------------------------------
        */

        if (
            action === 'status'
        ) {

            return reply(
                '⚙️ *BOT MODE STATUS*\n\n' +

                `Current Mode: ${
                    currentMode === 'private'
                        ? '🔒 PRIVATE'
                        : '🌍 PUBLIC'
                }\n\n` +

                '🌍 *PUBLIC*\n' +
                'Everyone can use the bot.\n\n' +

                '🔒 *PRIVATE*\n' +
                'Only the person who paired this session can use the bot.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | HELP
        |--------------------------------------------------------------------------
        */

        if (
            action !== 'public' &&
            action !== 'private'
        ) {

            return reply(
                '⚙️ *BOT MODE*\n\n' +

                'Use one of these commands:\n\n' +

                '🌍 `.mode public`\n' +
                'Allow everyone to use the bot.\n\n' +

                '🔒 `.mode private`\n' +
                'Allow only the session owner to use the bot.\n\n' +

                '📊 `.mode status`\n' +
                'Show the current mode.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | LOAD SETTINGS
        |--------------------------------------------------------------------------
        */

        let settings =
            ctx.settings;


        if (!settings) {

            try {

                settings =
                    await Setting.getOrCreate(
                        ctx.sessionId,
                        ctx.userId
                    );

            } catch (error) {

                console.error(
                    '[MODE SETTINGS ERROR]',
                    error
                );

                return reply(
                    '❌ Failed to load bot settings.'
                );
            }
        }


        /*
        |--------------------------------------------------------------------------
        | SAVE MODE
        |--------------------------------------------------------------------------
        */

        try {

            settings.mode =
                action;

            await settings.save();

        } catch (error) {

            console.error(
                '[MODE SAVE ERROR]',
                error
            );

            return reply(
                '❌ Failed to save bot mode.\n\n' +
                'Please try again.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | PUBLIC MODE
        |--------------------------------------------------------------------------
        */

        if (
            action === 'public'
        ) {

            return reply(
                '🌍 *PUBLIC MODE ENABLED* ✅\n\n' +

                '👥 Everyone can use this bot now.\n\n' +

                'Use:\n' +
                '`.mode private`\n' +
                'to make the bot private again.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | PRIVATE MODE
        |--------------------------------------------------------------------------
        */

        if (
            action === 'private'
        ) {

            return reply(
                '🔒 *PRIVATE MODE ENABLED* ✅\n\n' +

                '👑 Only the person who paired this session can use the bot.\n\n' +

                '🚫 Other users will be denied access.\n\n' +

                'Use:\n' +
                '`.mode public`\n' +
                'to allow everyone again.'
            );
        }
    }
};
