'use strict';

/**
 * .antidelete on|off|status
 * When ON, deleted messages are sent to YOUR private chat (only you see them).
 */

const Setting = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../database/models/Setting');

module.exports = {
    name: 'antidelete',
    aliases: ['antidel', 'antideletemsg'],
    category: 'group',
    description: 'Send deleted messages to your private chat',
    usage: '.antidelete on/off/status',
    emoji: '🗑️',
    ownerOnly: true,
    cooldown: 3,

    async execute(ctx) {
        const prefix = ctx.prefix || '.';
        const reply = (text) =>
            ctx.sock.sendMessage(ctx.from, { text: String(text) }, { quoted: ctx.msg });

        let settings;
        try {
            settings = await Setting.getOrCreate(ctx.sessionId, ctx.userId);
        } catch (_) {
            return reply('❌ Failed to load bot settings.');
        }
        if (!settings.metadata) settings.metadata = {};
        const md = settings.metadata;

        const action = String(ctx.args?.[0] || '').toLowerCase().trim();
        const isOn = md.antidelete === true;

        if (action === 'on' || action === 'off') {
            md.antidelete = action === 'on';
            settings.metadata = md;
            await settings.save();
            try { require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../bot/messages').invalidateSettingsCache(ctx.sessionId); } catch (_) {}
            return reply(action === 'on'
                ? '🗑️ *ANTIDELETE ON* ✅\n\nDeleted messages will be sent to your private chat.'
                : '🗑️ *ANTIDELETE OFF* ❌');
        }

        if (action === 'chat' || action === 'owner') {
            md.antideleteMode = action;
            md.antidelete = true;
            settings.metadata = md;
            await settings.save();
            try { require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../bot/messages').invalidateSettingsCache(ctx.sessionId); } catch (_) {}
            return reply(action === 'chat'
                ? '🗑️ *ANTIDELETE ON* ✅\n\nDeleted messages will be reposted in the SAME chat/group.'
                : '🗑️ *ANTIDELETE ON* ✅\n\nDeleted messages will be sent privately to YOU only.');
        }

        const mode = md.antideleteMode === 'chat' ? 'same chat' : 'private to you';
        return reply(
            `🗑️ *ANTIDELETE*\n\nStatus: ${isOn ? '🟢 ON' : '🔴 OFF'}\nSend to: ${mode}\n\n` +
            `• ${prefix}antidelete on\n• ${prefix}antidelete off\n` +
            `• ${prefix}antidelete owner  (private to you)\n• ${prefix}antidelete chat  (repost in the chat)`
        );
    }
};
