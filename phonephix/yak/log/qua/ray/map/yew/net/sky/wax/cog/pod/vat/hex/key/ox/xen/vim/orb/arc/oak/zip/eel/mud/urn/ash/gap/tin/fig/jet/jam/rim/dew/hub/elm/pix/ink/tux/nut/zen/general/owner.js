'use strict';

const config = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../config/config');

module.exports = {
    name: 'owner',
    category: 'general',

    aliases: [
        'creator',
        'dev'
    ],

    description: 'Show bot owner information',
    usage: '.owner',

    ownerOnly: false,
    cooldown: 5,

    async execute(ctx) {

        try {

            const owner =
                config.owner?.number ||
                config.owner?.phone ||
                config.ownerNumber ||
                'Not configured';

            const name =
                config.owner?.name ||
                config.ownerName ||
                'Dvary';

            const text =
                `╭━━━〔 👑 *BOT OWNER* 〕━━━╮\n` +
                `┃\n` +
                `┃ 👤 Name: *${name}*\n` +
                `┃ 📞 Number: *${owner}*\n` +
                `┃\n` +
                `┃ 🤖 Bot: *PHONEPHIX BOT*\n` +
                `┃\n` +
                `╰━━━━━━━━━━━━━━━━━━━━╯`;

            await ctx.sock.sendMessage(
                ctx.from,
                {
                    text
                },
                {
                    quoted: ctx.msg
                }
            );

        } catch (error) {

            console.error(
                '[OWNER COMMAND ERROR]',
                error
            );
        }
    }
};
