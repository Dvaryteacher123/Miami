/**
 * COMMAND: ban
 * Ban a user from using the bot
 */

'use strict';

const config = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../config/config');
const logger = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/logger');
const Ban = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../database/models/Ban');

module.exports = {
  name: 'ban',
  category: 'owner',
  aliases: ['blockuser', 'banuser'],
  description: 'Ban a user from using the bot',
  usage: 'ban @user [reason] (or reply)',
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
        info += `┃ 🚫 *BAN USER*\n`;
        info += `┃\n`;
        info += `┃ Usage : ${ctx.prefix}ban @user [reason]\n`;
        info += `┃       : ${ctx.prefix}ban 2557xxxxxxxx [reason]\n`;
        info += `╰━━━━━━━━━━━━━━━━━━━━━\n\n`;
        info += `_${config.bot.footer}_`;
        return reply(ctx, info);
      }

      const phone = target.split('@')[0].split(':')[0];
      const reasonArg = ctx.args.slice(1).join(' ').trim() || 'No reason provided';

      // Check if already banned
      const existing = await Ban.isBanned(ctx.sessionId, target, 'ban');
      if (existing) {
        return replyError(ctx, `@${phone} is already banned.`);
      }

      await Ban.ban({
        sessionId: ctx.sessionId,
        userId: ctx.userId,
        jid: target,
        phoneNumber: phone,
        reason: reasonArg,
        bannedBy: ctx.senderJid,
        type: 'ban'
      });

      let text = `╭━━━〔 *${config.bot.name.toUpperCase()}* 〕━━━\n`;
      text += `┃ 🚫 *USER BANNED*\n`;
      text += `┃\n`;
      text += `┃ 👤 User   : @${phone}\n`;
      text += `┃ 📝 Reason : ${reasonArg.slice(0, 80)}\n`;
      text += `╰━━━━━━━━━━━━━━━━━━━━━\n\n`;
      text += `_${config.bot.footer}_`;

      await ctx.sock.sendMessage(
        ctx.from,
        { text, mentions: [target] },
        { quoted: ctx.msg }
      );
    } catch (err) {
      logger.error(`[ban] ${err.message}`);
      return replyError(ctx, `Ban failed: ${err.message}`);
    }
  }
};
