'use strict';

module.exports = {
    name: 'botinfo',
    category: 'general',
    aliases: ['info', 'aboutbot'],
    description: 'Show bot information',
    usage: '.botinfo',
    ownerOnly: false,
    cooldown: 5,

    async execute(ctx) {
        const start = Date.now();

        const uptime = process.uptime();

        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        const memory = process.memoryUsage();
        const ram = (memory.rss / 1024 / 1024).toFixed(1);

        const latency = Date.now() - start;

        const text =
            `🤖 *PHONEPHIX BOT*\n\n` +
            `╭───────────────\n` +
            `│ 👨‍💻 Developer: Dvary\n` +
            `│ ⚡ Version: 1.0.0\n` +
            `│ 🟢 Status: Online\n` +
            `│ 📡 Response: ${latency}ms\n` +
            `│ 💾 RAM: ${ram} MB\n` +
            `│ ⏱️ Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s\n` +
            `│ 🗄️ Database: MongoDB\n` +
            `│ 🔌 Engine: Baileys\n` +
            `╰───────────────\n\n` +
            `🚀 *Powered by Dvary*`;

        return ctx.sock.sendMessage(
            ctx.from,
            { text },
            { quoted: ctx.msg }
        );
    }
};
