'use strict';

/**
 * Helper for simple ON/OFF owner settings stored in settings.metadata.<key>
 *   defineToggle({ name, aliases, key, title, emoji, description, onText, offText })
 *   Usage in WhatsApp:  .name on | off | status
 */

const Setting = require('../database/models/Setting');

module.exports = function defineToggle(def) {
    return {
        name: def.name,
        category: def.category || 'owner',
        aliases: def.aliases || [],
        description: def.description || '',
        usage: `.${def.name} on/off/status`,
        emoji: def.emoji || '⚙️',
        ownerOnly: true,
        cooldown: 2,

        async execute(ctx) {
            const prefix = ctx.prefix || '.';
            const reply = (t) => ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });

            let settings;
            try {
                settings = await Setting.getOrCreate(ctx.sessionId, ctx.userId);
            } catch (_) {
                return reply('❌ Failed to load bot settings.');
            }
            if (!settings.metadata) settings.metadata = {};
            const md = settings.metadata;

            const action = String(ctx.args?.[0] || '').toLowerCase().trim();
            const isOn = md[def.key] === true;

            if (action === 'on' || action === 'off') {
                md[def.key] = action === 'on';
                settings.metadata = md;
                if (typeof settings.markModified === 'function') settings.markModified('metadata');
                await settings.save();
                try { require('../bot/messages').invalidateSettingsCache(ctx.sessionId); } catch (_) {}
                return reply(
                    `${def.emoji || '⚙️'} *${def.title}* ${action === 'on' ? '🟢 ON' : '🔴 OFF'}\n\n` +
                    (action === 'on' ? def.onText : def.offText || 'Disabled.')
                );
            }

            return reply(
                `${def.emoji || '⚙️'} *${def.title}*\n\nStatus: ${isOn ? '🟢 ON' : '🔴 OFF'}\n\n${def.onText}\n\n` +
                `• ${prefix}${def.name} on\n• ${prefix}${def.name} off`
            );
        }
    };
};
