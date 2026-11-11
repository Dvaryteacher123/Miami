/**
 * COMMAND: unban
 * Unban a previously banned user
 */

'use strict';

const config = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../config/config');
const logger = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/logger');
const Ban = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../database/models/Ban');

module.exports = {
  name: 'unban',
  category: 'owner',
  aliases: ['unblockuser', 'removeban'],
  description: 'Unban a user',
  usage: 'unban @user (or reply)',
  ownerOnly: true,
  cooldown: 5,

  async run(ctx, { reply, replyError }) {
    try {
      let target =
        ctx.msg.message?.extendedTextMessage?.contextInfo?.participant || null;

      if (!target && ctx.msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
        target = ctx.msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
      }

      if (!target && ctx.args[0]) {
        const phone = String(ctx.args[0]).replace(/[^\d]/g, '');
        if (phone) target = `${phone}@s.whatsapp.net`;
      }

      if (!target) {
        let info = `╭━━━〔 *${config.bot.name.toUpperCase()}* 〕━━━\n`;
        info += `┃ ✅ *UNBAN USER*\n`;
        info += `┃\n`;
        info += `┃ Usage : ${ctx.prefix}unban @user\n`;
        info += `┃       : ${ctx.prefix}unban 2557xxxxxxxx\n`;
        info += `╰━━━━━━━━━━━━━━━━━━━━━\n\n`;
        info += `_${config.bot.footer}_`;
        return reply(ctx, info);
      }

      const phone = target.split('@')[0].split(':')[0];

      const result = await Ban.unban(ctx.sessionId, target, 'ban');
      if (!result) {
        return replyError(ctx, `@${phone} is not banned.`);
      }

      let text = `╭━━━〔 *${config.bot.name.toUpperCase()}* 〕━━━\n`;
      text += `┃ ✅ *USER UNBANNED*\n`;
      text += `┃\n`;
      text += `┃ 👤 User : @${phone}\n`;
      text += `╰━━━━━━━━━━━━━━━━━━━━━\n\n`;
      text += `_${config.bot.footer}_`;

      await ctx.sock.sendMessage(
        ctx.from,
        { text, mentions: [target] },
        { quoted: ctx.msg }
      );
    } catch (err) {
      logger.error(`[unban] ${err.message}`);
      return replyError(ctx, `Unban failed: ${err.message}`);
    }
  }
};
