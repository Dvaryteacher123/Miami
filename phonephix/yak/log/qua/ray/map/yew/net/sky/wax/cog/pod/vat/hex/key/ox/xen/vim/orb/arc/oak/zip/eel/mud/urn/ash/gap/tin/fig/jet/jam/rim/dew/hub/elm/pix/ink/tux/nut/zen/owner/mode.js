'use strict';

const Setting = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../database/models/Setting');

module.exports = {
    name: 'mode',
    category: 'owner',

    aliases: ['botmode'],

    description: 'Change bot mode between public and private',

    usage: '.mode private | .mode public',

    // Permission ya session owner/global owner
    // inashughulikiwa na bot/messages.js
    ownerOnly: false,

    cooldown: 3,

    async execute(ctx) {

        const reply = async (text) => {
            return ctx.sock.sendMessage(
                ctx.from,
                {
                    text: String(text)
                },
                {
                    quoted: ctx.msg
                }
            );
        };

        try {

            // ==============================
            // CHECK CONTEXT
            // ==============================

            if (!ctx.sessionId) {
                return reply(
                    `❌ *Session Error*\n\n` +
                    `Session ID haijapatikana.`
                );
            }

            // ==============================
            // GET MODE
            // ==============================

            const mode = String(
                ctx.args?.[0] || ''
            )
                .trim()
                .toLowerCase();

            // ==============================
            // VALIDATE MODE
            // ==============================

            if (
                mode !== 'private' &&
                mode !== 'public'
            ) {
                return reply(
                    `❌ *Invalid Mode*\n\n` +
                    `Tumia:\n\n` +
                    `🔒 ${ctx.prefix || '.'}mode private\n` +
                    `🌐 ${ctx.prefix || '.'}mode public`
                );
            }

            // ==============================
            // GET SESSION SETTINGS
            // ==============================

            const settings =
                await Setting.getOrCreate(
                    ctx.sessionId,
                    ctx.userId
                );

            // ==============================
            // SAVE MODE
            // ==============================

            settings.mode = mode;

            await settings.save();

            // ==============================
            // PRIVATE MODE
            // ==============================

            if (mode === 'private') {

                return reply(
                    `🔒 *PRIVATE MODE ENABLED*\n\n` +

                    `🤖 Bot mode: *PRIVATE*\n\n` +

                    `👤 Only the person who paired this bot can use it.\n` +
                    `👑 Global bot owner is also allowed.\n\n` +

                    `🌐 To make the bot public again:\n` +
                    `${ctx.prefix || '.'}mode public`
                );
            }

            // ==============================
            // PUBLIC MODE
            // ==============================

            return reply(
                `🌐 *PUBLIC MODE ENABLED*\n\n` +

                `🤖 Bot mode: *PUBLIC*\n\n` +

                `👥 Everyone can use available commands.\n` +
                `🛡️ Admin commands remain protected.\n` +
                `👑 Owner commands remain protected.\n\n` +

                `🔒 To make the bot private again:\n` +
                `${ctx.prefix || '.'}mode private`
            );

        } catch (error) {

            console.error(
                '[MODE ERROR]',
                error
            );

            return reply(
                `❌ *Mode Error*\n\n` +
                `${error?.message || String(error)}`
            );
        }
    }
};
