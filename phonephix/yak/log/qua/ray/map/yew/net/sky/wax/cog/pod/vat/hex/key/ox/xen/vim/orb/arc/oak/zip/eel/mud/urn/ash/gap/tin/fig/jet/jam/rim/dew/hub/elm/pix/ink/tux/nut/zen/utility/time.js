'use strict';

module.exports = {
    name: 'time',
    category: 'utility',
    aliases: ['saa'],
    description: 'Show current time',
    usage: '.time Tanzania',
    ownerOnly: false,
    cooldown: 5,

    async execute(ctx) {
        const reply = async (text) => {
            await ctx.sock.sendMessage(
                ctx.from,
                { text: String(text) },
                { quoted: ctx.msg }
            );
        };

        try {
            const timezone = 'Africa/Dar_es_Salaam';

            const now = new Date();

            const time = new Intl.DateTimeFormat('en-GB', {
                timeZone: timezone,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).format(now);

            const date = new Intl.DateTimeFormat('en-GB', {
                timeZone: timezone,
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).format(now);

            return reply(
                `╭━━━〔 🕐 TIME 〕━━━╮\n` +
                `┃\n` +
                `┃ 🇹🇿 Tanzania\n` +
                `┃ 📅 Date: ${date}\n` +
                `┃ ⏰ Time: ${time}\n` +
                `┃ 🌍 Zone: Africa/Dar_es_Salaam\n` +
                `┃\n` +
                `╰━━━━━━━━━━━━━━━━━━╯`
            );

        } catch (error) {
            console.error('[TIME ERROR]', error);
            return reply(`❌ Time failed.\n\n${error?.message || error}`);
        }
    }
};
