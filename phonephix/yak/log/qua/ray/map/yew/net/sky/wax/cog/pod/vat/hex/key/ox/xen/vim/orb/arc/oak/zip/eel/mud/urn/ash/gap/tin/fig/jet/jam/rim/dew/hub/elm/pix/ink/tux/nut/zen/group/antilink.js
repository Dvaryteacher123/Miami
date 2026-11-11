'use strict';

const Setting = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../database/models/Setting');

module.exports = {
    name: 'antilink',

    aliases: [
        'nolink',
        'antilinks'
    ],

    category: 'group',

    description: 'Enable or disable automatic link deletion in groups',

    usage: '.antilink on/off/status',

    ownerOnly: false,

    cooldown: 3,

    async execute(ctx) {

        /*
        |--------------------------------------------------------------------------
        | Reply helper
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
                    '[ANTILINK] Reply error:',
                    error
                );
            }
        };


        /*
        |--------------------------------------------------------------------------
        | GROUP ONLY
        |--------------------------------------------------------------------------
        */

        if (!ctx.isGroup) {
            return reply(
                '❌ *GROUP ONLY*\n\n' +
                'This command can only be used inside a WhatsApp group.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | GET ACTION
        |--------------------------------------------------------------------------
        */

        const action = String(
            ctx.args?.[0] || ''
        )
        .toLowerCase()
        .trim();


        /*
        |--------------------------------------------------------------------------
        | LOAD SETTINGS
        |--------------------------------------------------------------------------
        */

        let settings;

        try {

            settings = await Setting.getOrCreate(
                ctx.sessionId,
                ctx.userId
            );

        } catch (error) {

            console.error(
                '[ANTILINK] Setting load error:',
                error
            );

            return reply(
                '❌ Failed to load bot settings.'
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

        if (!settings.metadata.groups) {
            settings.metadata.groups = {};
        }

        if (!settings.metadata.groups[ctx.from]) {
            settings.metadata.groups[ctx.from] = {};
        }


        /*
        |--------------------------------------------------------------------------
        | CURRENT GROUP SETTINGS
        |--------------------------------------------------------------------------
        */

        const groupSettings =
            settings.metadata.groups[ctx.from];


        /*
        |--------------------------------------------------------------------------
        | STATUS
        |--------------------------------------------------------------------------
        */

        if (action === 'status') {

            const status =
                groupSettings.antilink === true
                    ? '🟢 ON'
                    : '🔴 OFF';

            return reply(
                `🔗 *ANTILINK STATUS*\n\n` +
                `Group: ${ctx.from}\n` +
                `Status: ${status}\n\n` +
                `Delete links automatically: ${
                    groupSettings.antilink === true
                        ? 'YES'
                        : 'NO'
                }`
            );
        }


        /*
        |--------------------------------------------------------------------------
        | HELP / USAGE
        |--------------------------------------------------------------------------
        */

        if (
            action !== 'on' &&
            action !== 'off'
        ) {

            return reply(
                `🔗 *ANTILINK*\n\n` +

                `Usage:\n` +
                `• .antilink on\n` +
                `• .antilink off\n` +
                `• .antilink status\n\n` +

                `Example:\n` +
                `.antilink on\n\n` +

                `⚠️ Bot must be a group admin ` +
                `to delete links.`
            );
        }


        /*
        |--------------------------------------------------------------------------
        | ENABLE / DISABLE
        |--------------------------------------------------------------------------
        */

        groupSettings.antilink =
            action === 'on';


        /*
        |--------------------------------------------------------------------------
        | SAVE
        |--------------------------------------------------------------------------
        */

        settings.markModified('metadata');

        try {

            await settings.save();

        } catch (error) {

            console.error(
                '[ANTILINK] Save error:',
                error
            );

            return reply(
                '❌ Failed to save AntiLink settings.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | ENABLED
        |--------------------------------------------------------------------------
        */

        if (action === 'on') {

            return reply(
                `🔗 *ANTILINK ENABLED* ✅\n\n` +

                `Links sent in this group will be ` +
                `automatically removed.\n\n` +

                `⚠️ Make sure the bot's WhatsApp ` +
                `account is a *Group Admin*.`
            );
        }


        /*
        |--------------------------------------------------------------------------
        | DISABLED
        |--------------------------------------------------------------------------
        */

        return reply(
            `🔗 *ANTILINK DISABLED* ❌\n\n` +
            `Links will no longer be automatically removed.`
        );
    }
};
