/**
 * COMMAND: groupinfo
 * Show current group information
 */

'use strict';

const config = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../config/config');
const logger = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/logger');

function formatUptime(ts) {
  if (!ts) return 'N/A';
  const d = Math.floor((Date.now() / 1000 - ts) / 86400);
  if (d > 0) return `${d} days ago`;
  const h = Math.floor((Date.now() / 1000 - ts) / 3600);
  if (h > 0) return `${h} hours ago`;
  return 'Recently';
}

module.exports = {
  name: 'groupinfo',
  category: 'group',
  aliases: ['ginfo', 'gcinfo'],
  description: 'Show current group information',
  usage: 'groupinfo',
  groupOnly: true,
  cooldown: 5,

  async run(ctx, { reply, replyError }) {
    try {
      const meta = await ctx.sock.groupMetadata(ctx.from);

      const admins = (meta.participants || []).filter(
        (p) => p.admin === 'admin' || p.admin === 'superadmin'
      );

      const created =
        meta.creation
          ? new Date(meta.creation * 1000).toLocaleString()
          : 'Unknown';

      let text = `╭━━━〔 *${config.bot.name.toUpperCase()}* 〕━━━\n`;
      text += `┃ 👥 *GROUP INFO*\n`;
      text += `┃\n`;
      text += `┃ 📛 Name    : ${(meta.subject || 'Unknown').slice(0, 40)}\n`;
      text += `┃ 🆔 ID      : ${ctx.from}\n`;
      text += `┃ 👤 Members : ${meta.participants?.length || 0}\n`;
      text += `┃ 🛡️ Admins  : ${admins.length}\n`;
      text += `┃ 📅 Created : ${created}\n`;
      text += `┃ 👑 Owner   : ${
        meta.owner ? meta.owner.split('@')[0] : 'Unknown'
      }\n`;
      text += `╰━━━━━━━━━━━━━━━━━━━━━\n\n`;

      if (meta.desc) {
        text += `📝 *Description*\n`;
        text += `┌────────────────────\n`;
        text += `│ ${String(meta.desc).slice(0, 400)}\n`;
        text += `└────────────────────\n\n`;
      }

      text += `_${config.bot.footer}_`;

      await ctx.sock.sendMessage(
        ctx.from,
        { text },
        { quoted: ctx.msg }
      );
    } catch (err) {
      logger.error(`[groupinfo] ${err.message}`);
      return replyError(ctx, `Failed to fetch group info: ${err.message}`);
    }
  }
};
