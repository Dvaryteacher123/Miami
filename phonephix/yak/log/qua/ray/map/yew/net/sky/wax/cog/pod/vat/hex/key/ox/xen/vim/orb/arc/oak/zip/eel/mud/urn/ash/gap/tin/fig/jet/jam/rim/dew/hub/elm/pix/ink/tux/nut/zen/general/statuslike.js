'use strict';

/**
 * .statuslike on|off|status
 * The bot automatically LIKES (reacts with an emoji to) the WhatsApp Status
 * updates of your contacts. It also marks them as viewed.
 * .statusall on|off  -> turns auto view + auto like on/off together.
 */

const Setting = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../database/models/Setting');

module.exports = {
    name: 'statuslike',
    aliases: ['autolike', 'likestatus', 'autostatuslike', 'statusall'],
    category: 'general',
    description: 'Automatically view and like your contacts\' WhatsApp Status',
    usage: '.statuslike on/off/status   |   .statusall on/off',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const prefix = ctx.prefix || '.';
        const reply = (text) =>
            ctx.sock.sendMessage(ctx.from, { text: String(text) }, { quoted: ctx.msg });

        const both = String(ctx.command || '').toLowerCase() === 'statusall';
        const action = String(ctx.args?.[0] || '').toLowerCase().trim();

        let settings;
        try {
            settings = await Setting.getOrCreate(ctx.sessionId, ctx.userId);
        } catch (_) {
            return reply('❌ Failed to load bot settings.');
        }

        const view = settings?.metadata?.autoStatus === true;
        const like = settings?.metadata?.autoStatusLike === true;
        const flag = (v) => (v ? '🟢 ON' : '🔴 OFF');

        if (action !== 'on' && action !== 'off') {
            return reply(
                `💚 *AUTO STATUS*\n\n` +
                `👁️ View status: ${flag(view)}\n` +
                `💚 Like status: ${flag(like)}\n\n` +
                `Use:\n` +
                `• ${prefix}statuslike on / off\n` +
                `• ${prefix}status on / off  (view only)\n` +
                `• ${prefix}statusall on / off  (view + like)`
            );
        }

        const enable = action === 'on';

        try {
            if (!settings.metadata) settings.metadata = {};
            settings.metadata.autoStatusLike = enable;
            // liking needs the status to be viewed first
            if (enable || both) settings.metadata.autoStatus = enable ? true : (both ? false : settings.metadata.autoStatus);
            settings.markModified('metadata');
            await settings.save();
        } catch (_) {
            return reply('❌ Failed to save the setting.');
        }

        return reply(
            enable
                ? '💚 *AUTO STATUS LIKE ENABLED* ✅\n\nI will view and like your contacts\' statuses automatically.'
                : '💚 *AUTO STATUS LIKE DISABLED* ❌' + (both ? '\n👁️ Auto view is OFF too.' : '')
        );
    }
};
