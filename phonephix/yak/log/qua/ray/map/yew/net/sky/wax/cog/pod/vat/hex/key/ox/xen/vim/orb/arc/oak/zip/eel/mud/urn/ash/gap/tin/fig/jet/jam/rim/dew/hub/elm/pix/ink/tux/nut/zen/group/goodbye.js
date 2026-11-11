'use strict';

module.exports = {
    name: 'goodbye',
    category: 'group',
    aliases: ['goodye'],
    description: 'Enable or disable goodbye messages',
    usage: '.goodbye on / .goodbye off',
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
                return reply('❌ This command can only be used in a group.');
            }

            const action = String(ctx.args?.[0] || '').toLowerCase();

            if (!['on', 'off'].includes(action)) {
                return reply(
                    `❌ *Invalid option*\n\n` +
                    `Usage: ${ctx.prefix || '.'}goodbye on\n` +
                    `Usage: ${ctx.prefix || '.'}goodbye off`
                );
            }

            const Setting = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../database/models/Setting');
            const settings = await Setting.getOrCreate(
                ctx.sessionId,
                ctx.userId
            );

            if (!settings.metadata) settings.metadata = {};
            if (!settings.metadata.groups) settings.metadata.groups = {};
            if (!settings.metadata.groups[ctx.from]) {
                settings.metadata.groups[ctx.from] = {};
            }

            settings.metadata.groups[ctx.from].goodbye =
                action === 'on';

            settings.markModified('metadata');
            await settings.save();

            return reply(
                action === 'on'
                    ? `👋 *GOODBYE ENABLED*\n\nGoodbye messages are now enabled for this group.`
                    : `👋 *GOODBYE DISABLED*\n\nGoodbye messages are now disabled for this group.`
            );

        } catch (error) {
            console.error('[GOODBYE ERROR]', error);

            return reply(
                `❌ Failed to update goodbye settings.\n\n${error?.message || error}`
            );
        }
    }
};
