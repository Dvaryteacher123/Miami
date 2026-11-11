'use strict';

const Setting = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../database/models/Setting');

module.exports = {
    name: 'antistatus',
    category: 'group',
    aliases: ['antigroupstatus', 'antitagstatus', 'nostatus', 'antimentionstatus', 'antistatusmention', 'antistatusmentions', 'statusmention'],
    description: 'Delete status posts / status mentions that members send to this group',
    usage: '.antistatus on/off',
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

            const action = String(ctx.args?.[0] || '')
                .toLowerCase()
                .trim();

            if (!['on', 'off'].includes(action)) {
                return reply(
                    '🛡️ *ANTI-STATUS SETTINGS*\n\n' +
                    'Enable:\n' +
                    '`.antistatus on`\n\n' +
                    'Disable:\n' +
                    '`.antistatus off`'
                );
            }

            const settings = await Setting.getOrCreate(
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

            settings.metadata.groups[ctx.from].antistatus =
                action === 'on';

            await settings.save();

            if (action === 'on') {
                return reply(
                    '🛡️ *ANTI-STATUS ENABLED*\n\n' +
                    '✅ Anti-status protection is now ON.\n\n' +
                    'When a non-admin member posts a status to this group (or mentions the group in a status), the message will be deleted.\n\n' +
                    '⚠️ The bot must be a *group admin* to delete messages.'
                );
            }

            return reply(
                '🛡️ *ANTI-STATUS DISABLED*\n\n' +
                '✅ Anti-status protection is now OFF.\n\n' +
                'Members can share statuses to this group normally.'
            );

        } catch (error) {
            console.error('[ANTISTATUS ERROR]', error);

            return reply(
                `❌ Failed to update anti-status settings.\n\n` +
                `${error?.message || error}`
            );
        }
    }
};
