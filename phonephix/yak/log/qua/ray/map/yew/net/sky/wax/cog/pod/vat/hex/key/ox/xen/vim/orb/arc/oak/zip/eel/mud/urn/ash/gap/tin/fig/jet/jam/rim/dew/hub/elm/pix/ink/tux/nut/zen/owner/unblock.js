/**
 * COMMAND: unblock
 * Unblock a WhatsApp user
 */

'use strict';

const config = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../config/config');
const logger = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/logger');
const Ban = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../database/models/Ban');

module.exports = {
  name: 'unblock',
  category: 'owner',
  aliases: ['waunblock'],
  description: 'Unblock a WhatsApp user',
  usage: 'unblock @user (or reply)',
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
        info += `┃ 🔓 *UNBLOCK USER*\n`;
        info += `┃\n`;
        info += `┃ Usage : ${ctx.prefix}unblock @user\n`;
        info += `┃       : ${ctx.prefix}unblock 2557xxxxxxxx\n`;
        info += `╰━━━━━━━━━━━━━━━━━━━━━\n\n`;
        info += `_${config.bot.footer}_`;
        return reply(ctx, info);
      }

      const phone = target.split('@')[0].split(':')[0];

      await ctx.sock.updateBlockStatus(target, 'unblock');

      // remove from DB ban list
      try {
        await Ban.unban(ctx.sessionId, target, 'block');
      } catch (_) {}

      let text = `╭━━━〔 *${config.bot.name.toUpperCase()}* 〕━━━\n`;
      text += `┃ 🔓 *USER UNBLOCKED*\n`;
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
      logger.error(`[unblock] ${err.message}`);
      return replyError(ctx, `Unblock failed: ${err.message}`);
    }
  }
};
