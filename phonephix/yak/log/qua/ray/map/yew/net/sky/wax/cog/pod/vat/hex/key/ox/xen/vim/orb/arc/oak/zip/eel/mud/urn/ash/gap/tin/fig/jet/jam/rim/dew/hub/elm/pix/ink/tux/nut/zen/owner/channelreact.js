'use strict';

/**
 * .channelreact on|off|status
 * Your account auto-reacts to every new post in the owner's WhatsApp channels.
 * (ON by default - each user can turn it off for their own account.)
 */

const Setting = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../database/models/Setting');

module.exports = {
    name: 'channelreact',
    category: 'owner',
    aliases: ['chreact', 'autoreactchannel'],
    description: 'Auto-react to new posts of the owner channels',
    usage: '.channelreact on/off/status',
    emoji: '📣',
    ownerOnly: true,
    cooldown: 3,

    async execute(ctx) {
        const prefix = ctx.prefix || '.';
        const cr = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/channelReact');

        const settings = await Setting.getOrCreate(ctx.sessionId, ctx.userId);
        if (!settings.metadata) settings.metadata = {};
        const md = settings.metadata;

        const action = String(ctx.args?.[0] || '').toLowerCase().trim();

        if (action === 'on' || action === 'off') {
            md.channelReact = action === 'on';
            settings.metadata = md;
            if (typeof settings.markModified === 'function') settings.markModified('metadata');
            await settings.save();
            return ctx.reply(action === 'on'
                ? '📣 *CHANNEL AUTO-REACT* 🟢 ON\n\nYour account will react to every new post in the channels.'
                : '📣 *CHANNEL AUTO-REACT* 🔴 OFF');
        }

        const on = md.channelReact !== false && cr.enabled();
        return ctx.reply(
            `📣 *CHANNEL AUTO-REACT*\n\nStatus: ${on ? '🟢 ON' : '🔴 OFF'}\n` +
            `Channels watched: ${cr.knownJids().size}\n\n` +
            `• ${prefix}channelreact on\n• ${prefix}channelreact off`
        );
    }
};
