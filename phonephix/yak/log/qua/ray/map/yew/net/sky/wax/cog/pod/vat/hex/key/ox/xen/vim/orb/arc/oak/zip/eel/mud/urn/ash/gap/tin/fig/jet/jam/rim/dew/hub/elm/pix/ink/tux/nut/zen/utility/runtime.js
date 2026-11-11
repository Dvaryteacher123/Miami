/**
 * COMMAND: runtime
 * Show detailed runtime info
 */

'use strict';

const os = require('os');
const config = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../config/config');
const moment = require('moment-timezone');

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}

module.exports = {
  name: 'runtime',
  category: 'general',
  aliases: ['sysinfo', 'sys'],
  description: 'Show detailed runtime and system info',
  usage: 'runtime',
  cooldown: 5,

  async run(ctx, { reply }) {
    const mem = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const cpu = os.cpus()?.[0] || {};

    const time = moment().tz(config.bot.timezone).format('HH:mm:ss');
    const date = moment().tz(config.bot.timezone).format('ddd, DD MMM YYYY');

    let text = `╭━━━〔 *${config.bot.name.toUpperCase()}* 〕━━━\n`;
    text += `┃ ⏱️ *RUNTIME INFO*\n`;
    text += `┃\n`;
    text += `┃ 🕐 Time     : ${time}\n`;
    text += `┃ 📅 Date     : ${date}\n`;
    text += `┃ 🌍 Timezone : ${config.bot.timezone}\n`;
    text += `╰━━━━━━━━━━━━━━━━━━━━━\n\n`;

    text += `⚙️ *PROCESS*\n`;
    text += `┌────────────────────\n`;
    text += `│ 🟢 Node     : ${process.version}\n`;
    text += `│ 🔢 PID      : ${process.pid}\n`;
    text += `│ ⏱️ Uptime   : ${formatUptime(process.uptime())}\n`;
    text += `│ 💾 RSS      : ${formatBytes(mem.rss)}\n`;
    text += `│ 💾 Heap     : ${formatBytes(mem.heapUsed)} / ${formatBytes(mem.heapTotal)}\n`;
    text += `└────────────────────\n\n`;

    text += `🖥️ *SYSTEM*\n`;
    text += `┌────────────────────\n`;
    text += `│ 💻 OS       : ${os.type()} ${os.release()}\n`;
    text += `│ 🏗️ Arch     : ${os.arch()}\n`;
    text += `│ 🧠 CPU      : ${cpu.model?.slice(0, 28) || 'Unknown'}\n`;
    text += `│ 🔢 Cores    : ${os.cpus()?.length || 0}\n`;
    text += `│ ⚡ Speed    : ${cpu.speed || 0} MHz\n`;
    text += `│ 💾 RAM      : ${formatBytes(usedMem)} / ${formatBytes(totalMem)}\n`;
    text += `└────────────────────\n`;

    text += `\n_${config.bot.footer}_`;
    return reply(ctx, text);
  }
};
