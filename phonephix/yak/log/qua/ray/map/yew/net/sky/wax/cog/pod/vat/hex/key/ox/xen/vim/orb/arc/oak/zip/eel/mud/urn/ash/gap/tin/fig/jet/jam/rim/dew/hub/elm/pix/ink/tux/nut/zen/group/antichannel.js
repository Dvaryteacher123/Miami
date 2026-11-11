'use strict';

/**
 * .antichannel on|off|status  (this group only)
 * When ON, messages forwarded from WhatsApp channels are deleted (admins are safe).
 */

const Setting = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../database/models/Setting');

module.exports = {
    name: 'antichannel',
    aliases: ['antichan', 'nochannel'],
    category: 'group',
    description: 'Delete messages forwarded from channels in this group',
    usage: '.antichannel on/off/status',
    emoji: '📢',
    ownerOnly: true,
    cooldown: 3,

    async execute(ctx) {
        const reply = (text) => ctx.sock.sendMessage(ctx.from, { text: String(text) }, { quoted: ctx.msg });

        if (!ctx.isGroup) return reply('❌ This command works only in groups.');

        let settings;
        try {
            settings = await Setting.getOrCreate(ctx.sessionId, ctx.userId);
        } catch (_) {
            return reply('❌ Failed to load bot settings.');
        }
        if (!settings.metadata) settings.metadata = {};
        if (!settings.metadata.groups) settings.metadata.groups = {};
        if (!settings.metadata.groups[ctx.from]) settings.metadata.groups[ctx.from] = {};
        const g = settings.metadata.groups[ctx.from];

        const action = String(ctx.args?.[0] || '').toLowerCase().trim();

        if (action === 'on' || action === 'off') {
            g.antichannel = action === 'on';
            settings.markModified('metadata');
            await settings.save();
            try { require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../bot/messages').invalidateSettingsCache(ctx.sessionId); } catch (_) {}
            return reply(action === 'on'
                ? '📢 *ANTICHANNEL ON* ✅\n\nChannel forwards will be deleted here (admins are not affected).\n\n_Make sure the bot is an admin._'
                : '📢 *ANTICHANNEL OFF* ❌');
        }

        return reply(
            `📢 *ANTICHANNEL*\n\nStatus: ${g.antichannel ? '🟢 ON' : '🔴 OFF'}\n\n` +
            `• ${ctx.prefix || '.'}antichannel on\n• ${ctx.prefix || '.'}antichannel off`
        );
    }
};
