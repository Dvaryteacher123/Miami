'use strict';

const Setting = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../database/models/Setting');

module.exports = {
    name: 'status',

    aliases: [
        'autostatus',
        'statusview',
        'viewstatus'
    ],

    category: 'general',

    description:
        'Enable or disable automatic WhatsApp Status viewing',

    usage:
        '.status on\n' +
        '.status off\n' +
        '.status status',

    ownerOnly: false,

    cooldown: 3,

    async execute(ctx) {

        /*
        |--------------------------------------------------------------------------
        | REPLY
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
                    '[STATUS REPLY ERROR]',
                    error
                );
            }
        };


        /*
        |--------------------------------------------------------------------------
        | SESSION OWNER ONLY
        |--------------------------------------------------------------------------
        */

        if (!ctx.isSessionOwner) {

            return reply(
                '❌ *Access Denied*\n\n' +
                '👑 Only the person who paired this bot session can change Auto Status.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | ACTION
        |--------------------------------------------------------------------------
        */

        const action =
            String(
                ctx.args?.[0] || 'status'
            )
            .toLowerCase()
            .trim();


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
                    '[STATUS SETTINGS ERROR]',
                    error
                );

                return reply(
                    '❌ Failed to load settings.'
                );
            }
        }


        /*
        |--------------------------------------------------------------------------
        | EXISTING STATUS SETTING
        |--------------------------------------------------------------------------
        */

        const current =
            settings?.metadata
                ?.autoStatus === true;


        /*
        |--------------------------------------------------------------------------
        | STATUS
        |--------------------------------------------------------------------------
        */

        if (
            action === 'status'
        ) {

            return reply(
                '👁️ *AUTO STATUS VIEWER*\n\n' +

                `Status: ${
                    current
                        ? '🟢 ON'
                        : '🔴 OFF'
                }\n\n` +

                'When enabled, the bot will automatically mark incoming WhatsApp Status updates as viewed.\n\n' +

                'Commands:\n' +
                '`.status on`\n' +
                '`.status off`\n' +
                '`.status status`'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | VALIDATE
        |--------------------------------------------------------------------------
        */

        if (
            action !== 'on' &&
            action !== 'off'
        ) {

            return reply(
                '👁️ *AUTO STATUS VIEWER*\n\n' +

                'Use:\n\n' +

                '`.status on`\n' +
                '`.status off`\n' +
                '`.status status`'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | MAKE SURE METADATA EXISTS
        |--------------------------------------------------------------------------
        */

        if (!settings.metadata) {
            settings.metadata = {};
        }


        /*
        |--------------------------------------------------------------------------
        | SAVE STATUS SETTING
        |--------------------------------------------------------------------------
        */

        settings.metadata.autoStatus =
            action === 'on';

        settings.markModified(
            'metadata'
        );


        try {

            await settings.save();

        } catch (error) {

            console.error(
                '[AUTO STATUS SAVE ERROR]',
                error
            );

            return reply(
                '❌ Failed to save Auto Status setting.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | ENABLED
        |--------------------------------------------------------------------------
        */

        if (
            action === 'on'
        ) {

            return reply(
                '👁️ *AUTO STATUS VIEWER ENABLED* ✅\n\n' +

                '🟢 The bot will automatically view incoming WhatsApp Status updates.\n\n' +

                'Use `.status off` to disable it.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | DISABLED
        |--------------------------------------------------------------------------
        */

        return reply(
            '👁️ *AUTO STATUS VIEWER DISABLED* 🔴\n\n' +

            'The bot will no longer automatically view Status updates.\n\n' +

            'Use `.status on` to enable it again.'
        );
    }
};
