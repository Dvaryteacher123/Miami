'use strict';

module.exports = {
    name: 'mode',
    aliases: ['botmode'],
    description: 'Badilisha hali ya bot (Public au Private)',
    category: 'owner',
    usage: '.mode [public/private]',
    
    async execute(ctx) {
        const { sock, from, msg, args, settings, prefix } = ctx;

        const requestedMode = String(args?.[0] || '').toLowerCase().trim();

        if (requestedMode !== 'public' && requestedMode !== 'private') {
            await sock.sendMessage(
                from,
                {
                    text:
                        '❌ *Invalid Mode*\n\n' +
                        `Please use it like this:\n` +
                        `• \`${prefix}mode public\`\n` +
                        `• \`${prefix}mode private\``
                },
                { quoted: msg }
            );
            return;
        }

        if (!settings) {
            await sock.sendMessage(
                from,
                { text: '❌ Could not load the bot settings.' },
                { quoted: msg }
            );
            return;
        }

        try {
            settings.mode = requestedMode;
            await settings.save();

            const responseText =
                requestedMode === 'private'
                    ? '🔒 *PRIVATE MODE ENABLED*\n\n' +
                      'The bot is now in *Private* mode.\n' +
                      '👑 Only the person who paired the bot can use it.'
                    : '🌍 *PUBLIC MODE ENABLED*\n\n' +
                      'The bot is now in *Public* mode.\n' +
                      '✅ Everyone can use the bot.';

            await sock.sendMessage(
                from,
                { text: responseText },
                { quoted: msg }
            );

        } catch (error) {
            await sock.sendMessage(
                from,
                { text: `❌ Hitilafu imetokea wakati wa kuhifadhi mode: ${error.message || error}` },
                { quoted: msg }
            );
        }
    }
};

