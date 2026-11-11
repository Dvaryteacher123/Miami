'use strict';

const Setting = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../database/models/Setting');

module.exports = {
    name: 'antimention',
    category: 'group',
    aliases: ['anti-mention', 'nomention'],
    description: 'Delete messages when non-admin members mention group admins',
    usage: '.antimention on/off',
    ownerOnly: false,
    cooldown: 5,

    async execute(ctx) {
        // ".antimention status on|off" = same as ".antistatus on|off"
        if (String(ctx.args?.[0] || '').toLowerCase() === 'status') {
            return require('./antistatus').execute({ ...ctx, args: (ctx.args || []).slice(1) });
        }

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
                    '🛡️ *ANTI-MENTION SETTINGS*\n\n' +
                    'Enable:\n' +
                    '`.antimention on`\n\n' +
                    'Disable:\n' +
                    '`.antimention off`'
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

            settings.metadata.groups[ctx.from].antimention =
                action === 'on';

            await settings.save();

            if (action === 'on') {
                return reply(
                    '🛡️ *ANTI-MENTION ENABLED*\n\n' +
                    '✅ Anti-mention protection is now ON.\n\n' +
                    'Messages from non-admin members mentioning group admins will be deleted.'
                );
            }

            return reply(
                '🛡️ *ANTI-MENTION DISABLED*\n\n' +
                '✅ Anti-mention protection is now OFF.\n\n' +
                'Members can mention admins normally.'
            );

        } catch (error) {
            console.error('[ANTIMENTION ERROR]', error);

            return reply(
                `❌ Failed to update anti-mention settings.\n\n` +
                `${error?.message || error}`
            );
        }
    }
};
