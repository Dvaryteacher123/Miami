'use strict';

const os = require('os');

const fmtTime = (s) => {
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
};
const mb = (b) => `${(b / 1048576).toFixed(0)} MB`;

module.exports = {
    name: 'botstats',
    category: 'utility',
    aliases: ['server', 'ram'],
    description: 'Server info: RAM, CPU, uptime, commands',
    usage: '.botstats',
    emoji: '🖥️',
    cooldown: 5,

    async execute(ctx) {
        const mem = process.memoryUsage();
        const total = os.totalmem();
        const free = os.freemem();
        const count = typeof ctx.getCommands === 'function' ? ctx.getCommands().length : '-';

        return ctx.reply(
            `🖥️ *BOT STATS*\n\n` +
            `⏱️ Bot uptime: ${fmtTime(process.uptime())}\n` +
            `🖧 Server uptime: ${fmtTime(os.uptime())}\n` +
            `🧠 Bot RAM: ${mb(mem.rss)} (heap ${mb(mem.heapUsed)})\n` +
            `💾 Server RAM: ${mb(total - free)} / ${mb(total)}\n` +
            `⚙️ CPU: ${os.cpus().length} core(s), load ${os.loadavg()[0].toFixed(2)}\n` +
            `🟢 Node: ${process.version}\n` +
            `📜 Commands: ${count}\n` +
            `🧩 Platform: ${os.platform()} ${os.arch()}`
        );
    }
};
