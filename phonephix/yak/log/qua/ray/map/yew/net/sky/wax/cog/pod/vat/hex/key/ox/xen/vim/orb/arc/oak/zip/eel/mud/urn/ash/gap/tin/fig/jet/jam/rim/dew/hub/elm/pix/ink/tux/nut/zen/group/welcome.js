'use strict';

const Setting =
    require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../database/models/Setting');

module.exports = {

    name: 'welcome',

    aliases: [
        'welcomegroup'
    ],

    category: 'group',

    description:
        'Enable or disable welcome messages',

    usage:
        '.welcome on/off/status',

    ownerOnly: false,

    cooldown: 3,

    async execute(ctx) {

        const reply = async (text) => {

            return ctx.sock.sendMessage(
                ctx.from,
                {
                    text: String(text)
                },
                {
                    quoted: ctx.msg
                }
            );
        };

        if (!ctx.isGroup) {

            return reply(
                '❌ *GROUP ONLY*\n\n' +
                'This command can only be used in groups.'
            );
        }

        const action =
            String(
                ctx.args?.[0] || ''
            )
            .toLowerCase()
            .trim();

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

        if (
            !settings.metadata.groups[
                ctx.from
            ]
        ) {

            settings.metadata.groups[
                ctx.from
            ] = {};
        }

        const groupSettings =
            settings.metadata.groups[
                ctx.from
            ];

        if (action === 'status') {

            return reply(
                `👋 *WELCOME STATUS*\n\n` +
                `Status: ${
                    groupSettings.welcome
                        ? '🟢 ON'
                        : '🔴 OFF'
                }`
            );
        }

        if (
            action !== 'on' &&
            action !== 'off'
        ) {

            return reply(
                `⚙️ *WELCOME SETTINGS*\n\n` +
                `🟢 ${ctx.prefix || '.'}welcome on\n` +
                `🔴 ${ctx.prefix || '.'}welcome off\n` +
                `📊 ${ctx.prefix || '.'}welcome status`
            );
        }

        groupSettings.welcome =
            action === 'on';

        settings.markModified(
            'metadata'
        );

        await settings.save();

        if (action === 'on') {

            return reply(
                `👋 *WELCOME ENABLED*\n\n` +
                `✅ Welcome message enabled.\n\n` +
                `When a new member joins,\n` +
                `the bot will send a welcome message.`
            );
        }

        return reply(
            `👋 *WELCOME DISABLED*\n\n` +
            `🔴 Welcome message disabled.`
        );
    }
};
