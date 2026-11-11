'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'kill',

    aliases: [
        'die',
        'murder',
        'finish'
    ],

    category: 'media',

    description: 'Send a funny cartoon kill animation',

    usage: '.kill',

    ownerOnly: false,
    groupOnly: false,
    privateOnly: false,
    adminOnly: false,
    botAdminOnly: false,

    cooldown: 5,

    async run(ctx) {
        const { sock, msg, from } = ctx;

        try {
            const videoPath = path.join(
                process.cwd(),
                'media',
                'kill.mp4'
            );

            if (!fs.existsSync(videoPath)) {
                return await sock.sendMessage(
                    from,
                    {
                        text:
                            '❌ *Kill video not found.*\n\n' +
                            'Place your cartoon video here:\n' +
                            '`media/kill.mp4`'
                    },
                    { quoted: msg }
                );
            }

            const stats =
                fs.statSync(videoPath);

            if (stats.size === 0) {
                throw new Error(
                    'kill.mp4 is empty.'
                );
            }

            if (
                stats.size >
                50 * 1024 * 1024
            ) {
                return await sock.sendMessage(
                    from,
                    {
                        text:
                            '❌ *Video is too large.*\n\n' +
                            'Keep `kill.mp4` below 50MB.'
                    },
                    { quoted: msg }
                );
            }

            await sock.sendMessage(
                from,
                {
                    video: {
                        url: videoPath
                    },

                    mimetype: 'video/mp4',

                    caption:
                        '🔪😂 *PHONEPHIX KILL*\n\n' +
                        '💀 Cartoon mode activated!'
                },
                {
                    quoted: msg
                }
            );

        } catch (error) {
            console.error(
                '[KILL ERROR]',
                error
            );

            await sock.sendMessage(
                from,
                {
                    text:
                        '❌ *Failed to send kill animation.*\n\n' +
                        `${error?.message || 'Unknown error'}`
                },
                {
                    quoted: msg
                }
            );
        }
    }
};
