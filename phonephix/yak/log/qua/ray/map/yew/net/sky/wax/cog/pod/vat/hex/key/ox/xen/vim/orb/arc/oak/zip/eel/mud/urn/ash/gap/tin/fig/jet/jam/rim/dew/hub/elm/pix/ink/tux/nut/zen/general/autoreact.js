'use strict';

/**
 * .autoreact on|off|status|all|groups|private|emoji <list>|reset
 * When ON, the bot reacts with an emoji to every message people send
 * (it skips commands - those already get their own reaction).
 * Works per session. Default emojis can be changed with .autoreact emoji ❤️ 🔥 😂
 */

const Setting = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../database/models/Setting');

const DEFAULT_EMOJIS = ['❤️', '🔥', '😂', '😍', '👍', '💯', '🙌', '😎', '💚', '👏'];

module.exports = {
    name: 'autoreact',
    aliases: ['areact', 'reactall'],
    category: 'general',
    description: 'Bot reacts with an emoji to every message',
    usage: '.autoreact on/off/status/all/groups/private/emoji/reset',
    emoji: '😍',
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

        const isOn = md.autoreact === true;
        const scope = md.autoreactScope || 'all';
        const emojis = Array.isArray(md.autoreactEmojis) && md.autoreactEmojis.length
            ? md.autoreactEmojis
            : DEFAULT_EMOJIS;

        const action = String(ctx.args?.[0] || '').toLowerCase().trim();

        const statusText = () =>
            `😍 *AUTOREACT*\n\n` +
            `Status: ${isOn ? '🟢 ON' : '🔴 OFF'}\n` +
            `Where: ${scope === 'all' ? 'groups + private' : scope}\n` +
            `Emojis: ${emojis.join(' ')}`;

        const save = async () => {
            settings.metadata = md;
            await settings.save();
            try { require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../bot/messages').invalidateSettingsCache(ctx.sessionId); } catch (_) {}
        };

        try {
            if (!action || action === 'status') {
                return reply(
                    statusText() + `\n\nUse:\n` +
                    `• ${prefix}autoreact on / off\n` +
                    `• ${prefix}autoreact all / groups / private\n` +
                    `• ${prefix}autoreact emoji ❤️ 🔥 😂\n` +
                    `• ${prefix}autoreact reset`
                );
            }

            if (action === 'on' || action === 'off') {
                md.autoreact = action === 'on';
                await save();
                return reply(action === 'on'
                    ? '😍 *AUTOREACT ENABLED* ✅\n\nI will react to every message.'
                    : '😍 *AUTOREACT DISABLED* ❌');
            }

            if (action === 'all' || action === 'groups' || action === 'private') {
                md.autoreactScope = action;
                await save();
                return reply(`😍 Autoreact will work in: *${action === 'all' ? 'groups + private' : action}*`);
            }

            if (action === 'reset') {
                delete md.autoreactEmojis;
                md.autoreactScope = 'all';
                await save();
                return reply('😍 Autoreact reset to default emojis and scope.');
            }

            if (action === 'emoji' || action === 'emojis') {
                const list = (ctx.args || []).slice(1).join(' ')
                    .match(/\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic})*/gu) || [];
                if (!list.length) return reply(`❌ Usage: ${prefix}autoreact emoji ❤️ 🔥 😂`);
                md.autoreactEmojis = [...new Set(list)].slice(0, 12);
                await save();
                return reply(`😍 Autoreact emojis: ${md.autoreactEmojis.join(' ')}`);
            }

            return reply(`❌ Unknown option. Send ${prefix}autoreact to see the options.`);
        } catch (_) {
            return reply('❌ Failed to save autoreact setting.');
        }
    }
};
