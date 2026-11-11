'use strict';

module.exports = {
    name: 'alive',
    category: 'general',

    aliases: ['status'],

    description: 'Check if the bot is online',
    usage: '.alive',

    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {

        try {

            const uptime =
                process.uptime();

            const days =
                Math.floor(
                    uptime / 86400
                );

            const hours =
                Math.floor(
                    (uptime % 86400) / 3600
                );

            const minutes =
                Math.floor(
                    (uptime % 3600) / 60
                );

            const seconds =
                Math.floor(
                    uptime % 60
                );

            const text =
                `╭━━━〔 🤖 *PHONEPHIX BOT* 〕━━━╮\n` +
                `┃\n` +
                `┃ 🟢 *BOT IS ONLINE*\n` +
                `┃\n` +
                `┃ ⚡ Status: Online\n` +
                `┃ ⏱️ Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s\n` +
                `┃\n` +
                `╰━━━━━━━━━━━━━━━━━━━━╯`;

            await ctx.sock.sendMessage(
                ctx.from,
                { text },
                { quoted: ctx.msg }
            );

        } catch (error) {
            console.error(
                '[ALIVE ERROR]',
                error
            );
        }
    }
};
