/**
 * COMMAND: uptime
 * Show bot uptime
 */

'use strict';

const config = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../config/config');

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

module.exports = {
  name: 'uptime',
  category: 'general',
  aliases: ['up'],
  description: 'Show how long the bot has been running',
  usage: 'uptime',
  cooldown: 3,

  async run(ctx, { reply }) {
    const processUptime = formatUptime(process.uptime());
    const botUptime = formatUptime(ctx.manager?.getSessionCount ? 0 : 0);
    const conn = ctx.manager?.getSession?.(ctx.sessionId);
    const sessionUptime = conn && conn.getUptime ? formatUptime(conn.getUptime() / 1000) : '0s';

    let text = `╭━━━〔 *${config.bot.name.toUpperCase()}* 〕━━━\n`;
    text += `┃ ⏱️ *UPTIME*\n`;
    text += `┃ 🖥️ Process  : ${processUptime}\n`;
    text += `┃ 🔌 Session  : ${sessionUptime}\n`;
    text += `┃ 📦 Sessions : ${ctx.manager?.getSessionCount?.() ?? 0} active\n`;
    text += `╰━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `\n_${config.bot.footer}_`;

    return reply(ctx, text);
  }
};
