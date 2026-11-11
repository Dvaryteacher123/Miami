/**
 * COMMAND: restart
 * Restart the current session (reconnect)
 */

'use strict';

const config = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../config/config');
const logger = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/logger');

module.exports = {
  name: 'restart',
  category: 'owner',
  aliases: ['reconnect', 'reboot'],
  description: 'Restart the current bot session',
  usage: 'restart',
  ownerOnly: true,
  cooldown: 15,

  async run(ctx, { reply, replyError }) {
    try {
      let text = `╭━━━〔 *${config.bot.name.toUpperCase()}* 〕━━━\n`;
      text += `┃ 🔄 *RESTARTING*\n`;
      text += `┃\n`;
      text += `┃ ⏳ Session will reconnect...\n`;
      text += `┃ 🆔 ${ctx.sessionId}\n`;
      text += `╰━━━━━━━━━━━━━━━━━━━━━\n\n`;
      text += `_${config.bot.footer}_`;

      await reply(ctx, text);

      // Small delay to make sure message sends
      await new Promise((r) => setTimeout(r, 1200));

      // stop without logout → session stays in DB → manager can reconnect
      if (ctx.manager && typeof ctx.manager.stopSession === 'function') {
        await ctx.manager.stopSession(ctx.sessionId, { logout: false });
        await new Promise((r) => setTimeout(r, 1500));
        await ctx.manager.startSession(ctx.sessionId);
      }
    } catch (err) {
      logger.error(`[restart] ${err.message}`);
      return replyError(ctx, `Restart failed: ${err.message}`);
    }
  }
};
