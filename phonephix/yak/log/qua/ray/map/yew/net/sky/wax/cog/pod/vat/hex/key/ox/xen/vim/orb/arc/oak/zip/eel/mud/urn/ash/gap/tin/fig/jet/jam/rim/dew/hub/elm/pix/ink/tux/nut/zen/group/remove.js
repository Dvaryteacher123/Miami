/**
 * COMMAND: remove
 * Remove (kick) a user from the group
 */

'use strict';

const config = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../config/config');
const logger = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/logger');

module.exports = {
  name: 'remove',
  category: 'group',
  aliases: ['kick', 'removeuser'],
  description: 'Remove a user from the group',
  usage: 'remove @user (or reply to their message)',
  groupOnly: true,
  adminOnly: true,
  botAdminOnly: true,
  cooldown: 5,

  async run(ctx, { replyError }) {
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
        return replyError(ctx, 'Mention a user or reply to their message.');
      }

      if (target === ctx.sock.user?.id) {
        return replyError(ctx, 'I cannot remove myself.');
      }

      const meta = await ctx.sock.groupMetadata(ctx.from);
      const existing = meta.participants.find((p) => p.id === target);

      if (!existing) {
        return replyError(ctx, 'That user is not in this group.');
      }

      if (existing.admin === 'superadmin') {
        return replyError(ctx, 'Cannot remove the group creator.');
      }

      await ctx.sock.groupParticipantsUpdate(ctx.from, [target], 'remove');

      const num = target.split('@')[0].split(':')[0];

      let text = `╭━━━〔 *${config.bot.name.toUpperCase()}* 〕━━━\n`;
      text += `┃ 👥 *REMOVE MEMBER*\n`;
      text += `┃\n`;
      text += `┃ ✅ @${num} has been removed.\n`;
      text += `╰━━━━━━━━━━━━━━━━━━━━━\n\n`;
      text += `_${config.bot.footer}_`;

      await ctx.sock.sendMessage(
        ctx.from,
        { text, mentions: [target] },
        { quoted: ctx.msg }
      );
    } catch (err) {
      logger.error(`[remove] ${err.message}`);
      return replyError(ctx, `Remove failed: ${err.message}`);
    }
  }
};
