/**
 * COMMAND: bot
 * Show bot status for current session
 */

'use strict';

const config = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../config/config');
const Session = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../database/models/Session');

module.exports = {
  name: 'bot',
  category: 'general',
  aliases: ['status', 'mysession'],
  description: 'Show current bot session status',
  usage: 'bot',
  cooldown: 5,

  async run(ctx, { reply }) {
    let doc = null;
    try {
      doc = await Session.findBySessionId(ctx.sessionId);
    } catch (_) {}

    const conn = ctx.manager?.getSession?.(ctx.sessionId);
    const status = conn?.getStatus?.() || doc?.status || 'unknown';
    const uptime = conn?.getUptime ? Math.floor(conn.getUptime() / 1000) : 0;

    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);

    const statusEmoji =
      status === 'connected' ? '🟢' :
      status === 'connecting' ? '🟡' :
      status === 'pairing' ? '🔵' : '🔴';

    let text = `╭━━━〔 *${config.bot.name.toUpperCase()}* 〕━━━\n`;
    text += `┃ ${statusEmoji} *STATUS: ${String(status).toUpperCase()}*\n`;
    text += `┃\n`;
    text += `┃ 🆔 Session  : ${ctx.sessionId}\n`;
    text += `┃ 📞 Phone    : ${doc?.phoneNumber ? `+${doc.phoneNumber}` : 'N/A'}\n`;
    text += `┃ 👤 Push     : ${doc?.pushName || 'N/A'}\n`;
    text += `┃ ⏱️ Uptime   : ${h}h ${m}m ${s}s\n`;
    text += `┃ 📨 Sent     : ${doc?.messagesSent || 0}\n`;
    text += `┃ 📥 Received : ${doc?.messagesReceived || 0}\n`;
    text += `┃ ⚡ Commands : ${doc?.commandsUsed || 0}\n`;
    text += `╰━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `\n_${config.bot.footer}_`;

    return reply(ctx, text);
  }
};
