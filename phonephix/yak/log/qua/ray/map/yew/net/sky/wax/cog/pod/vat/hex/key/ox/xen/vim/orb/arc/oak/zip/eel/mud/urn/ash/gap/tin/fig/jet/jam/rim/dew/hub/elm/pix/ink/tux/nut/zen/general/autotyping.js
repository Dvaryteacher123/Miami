'use strict';

/**
 * .autotyping on|off|status
 * When enabled, people who message the bot see "typing..." for a few seconds
 * before the bot replies. Works for all chats of this session.
 */

const Setting = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../database/models/Setting');

module.exports = {
    name: 'autotyping',
    aliases: ['typing', 'autotype'],
    category: 'general',
    description: 'Show "typing..." to people when they message the bot',
    usage: '.autotyping on/off/status',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const prefix = ctx.prefix || '.';

        const reply = (text) =>
            ctx.sock.sendMessage(
                ctx.from,
                { text: String(text) },
                { quoted: ctx.msg }
            );

        const action = String(ctx.args?.[0] || '').toLowerCase().trim();

        let settings;

        try {
            settings = await Setting.getOrCreate(ctx.sessionId, ctx.userId);
        } catch (error) {
            return reply('❌ Failed to load bot settings.');
        }

        const isOn =
            settings.autoTyping === true ||
            settings.metadata?.autotyping === true;

        if (action === 'status') {
            return reply(
                `⌨️ *AUTOTYPING STATUS*\n\n` +
                `Status: ${isOn ? '🟢 ON' : '🔴 OFF'}`
            );
        }

        if (action !== 'on' && action !== 'off') {
            return reply(
                `⌨️ *AUTOTYPING*\n\n` +
                `Status: ${isOn ? '🟢 ON' : '🔴 OFF'}\n\n` +
                `Use:\n` +
                `• ${prefix}autotyping on\n` +
                `• ${prefix}autotyping off\n` +
                `• ${prefix}autotyping status`
            );
        }

        const enable = action === 'on';

        try {
            settings.autoTyping = enable;

            if (!settings.metadata) settings.metadata = {};
            settings.metadata.autotyping = enable;

            await settings.save();

            // apply immediately (settings are cached for 60s otherwise)
            try {
                require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../bot/messages').invalidateSettingsCache(ctx.sessionId);
            } catch (_) {}

        } catch (error) {
            return reply('❌ Failed to save autotyping setting.');
        }

        return reply(
            enable
                ? '⌨️ *AUTOTYPING ENABLED* ✅\n\nPeople will see "typing..." when they message you.'
                : '⌨️ *AUTOTYPING DISABLED* ❌'
        );
    }
};
