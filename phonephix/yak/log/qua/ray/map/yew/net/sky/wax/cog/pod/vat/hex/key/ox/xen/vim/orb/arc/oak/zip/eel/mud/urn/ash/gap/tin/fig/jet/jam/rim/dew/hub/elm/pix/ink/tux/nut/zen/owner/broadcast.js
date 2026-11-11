/**
 * COMMAND: broadcast
 * Broadcast a message to all chats (groups + private)
 */

'use strict';

const config = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../config/config');
const logger = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/logger');

module.exports = {
  name: 'broadcast',
  category: 'owner',
  aliases: ['bc', 'announce'],
  description: 'Broadcast a message to all chats',
  usage: 'broadcast <message>',
  ownerOnly: true,
  cooldown: 30,

  async run(ctx, { reply, replyError }) {
    try {
      const message = ctx.query;

      if (!message) {
        let info = `╭━━━〔 *${config.bot.name.toUpperCase()}* 〕━━━\n`;
        info += `┃ 📢 *BROADCAST*\n`;
        info += `┃\n`;
        info += `┃ Usage : ${ctx.prefix}broadcast <message>\n`;
        info += `┃ Info  : Sends to all your chats\n`;
        info += `╰━━━━━━━━━━━━━━━━━━━━━\n\n`;
        info += `_${config.bot.footer}_`;
        return reply(ctx, info);
      }

      const chats = ctx.store?.chats || [];
      const sock = ctx.sock;

      // collect jids from store if available
      let jids = [];
      try {
        if (typeof sock.groupFetchAllParticipating === 'function') {
          const groups = await sock.groupFetchAllParticipating();
          jids = Object.keys(groups || {});
        }
      } catch (_) {}

      if (!jids.length) {
        return replyError(ctx, 'No chats found to broadcast to.');
      }

      let sent = 0;
      let failed = 0;

      const header =
        `╭━━━〔 *${config.bot.name.toUpperCase()}* 〕━━━\n` +
        `┃ 📢 *BROADCAST*\n` +
        `┃\n`;

      const body = `${header}┃ ${message}\n╰━━━━━━━━━━━━━━━━━━━━━\n\n_${config.bot.footer}_`;

      for (const jid of jids) {
        try {
          await sock.sendMessage(jid, { text: body });
          sent++;
          // small delay to avoid spam detection
          await new Promise((r) => setTimeout(r, 1500));
        } catch (err) {
          failed++;
        }
      }

      let result = `╭━━━〔 *${config.bot.name.toUpperCase()}* 〕━━━\n`;
      result += `┃ 📢 *BROADCAST COMPLETE*\n`;
      result += `┃\n`;
      result += `┃ ✅ Sent   : ${sent}\n`;
      result += `┃ ❌ Failed : ${failed}\n`;
      result += `┃ 📦 Total  : ${jids.length}\n`;
      result += `╰━━━━━━━━━━━━━━━━━━━━━\n\n`;
      result += `_${config.bot.footer}_`;

      return reply(ctx, result);
    } catch (err) {
      logger.error(`[broadcast] ${err.message}`);
      return replyError(ctx, `Broadcast failed: ${err.message}`);
    }
  }
};
