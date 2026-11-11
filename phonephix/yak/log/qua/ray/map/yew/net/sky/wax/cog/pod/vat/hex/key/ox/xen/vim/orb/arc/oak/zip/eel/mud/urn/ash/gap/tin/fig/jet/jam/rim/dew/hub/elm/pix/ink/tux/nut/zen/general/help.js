/**
 * =====================================================
 *  COMMAND: help
 *  Show detailed help for a single command
 *  (Same styled box as menu)
 * =====================================================
 */

'use strict';

const config = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../config/config');
const { getCommand, listCommands } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../bot/handler');

const CATEGORY_EMOJI = {
  general: '📋',
  media: '🎨',
  group: '👥',
  utility: '🛠️',
  owner: '👑'
};

function boxHeader(title) {
  return `╭━━━〔 *${title}* 〕━━━\n`;
}

function boxFooter() {
  return `╰━━━━━━━━━━━━━━━━━━━━━`;
}

function boxDivider() {
  return `┌────────────────────\n`;
}

function boxDividerEnd() {
  return `└────────────────────\n`;
}

module.exports = {
  name: 'help',
  category: 'general',
  aliases: ['h', 'info'],
  description: 'Show detailed help for a command',
  usage: 'help <command>',
  cooldown: 3,

  async run(ctx, { reply }) {
    const prefix = ctx.prefix || config.bot.defaultPrefix;
    const target = (ctx.args[0] || '').toLowerCase();

    // ---------- NO ARG: show summary ----------
    if (!target) {
      const all = listCommands();
      const total = all.length;

      let text = boxHeader(config.bot.name.toUpperCase());
      text += `┃ 🧩 Version : ${config.bot.version}\n`;
      text += `┃ ⚙️ Prefix  : ${prefix}\n`;
      text += `┃ 👤 Owner   : ${config.bot.owner}\n`;
      text += `┃ 📦 Total   : ${total} commands\n`;
      text += boxFooter() + `\n\n`;

      text += `💡 *Usage:*\n`;
      text += `┌────────────────────\n`;
      text += `│ ${prefix}help <command>\n`;
      text += `│   _Show detailed info about a command_\n`;
      text += `│\n`;
      text += `│ ${prefix}menu [category]\n`;
      text += `│   _List all commands by category_\n`;
      text += boxDividerEnd();

      text += `\n_${config.bot.footer}_`;
      return reply(ctx, text);
    }

    // ---------- WITH ARG: show detailed help ----------
    const cmd = getCommand(target);

    if (!cmd) {
      let text = boxHeader('❌ COMMAND NOT FOUND');
      text += `┃ The command *${target}* does not exist.\n`;
      text += `┃ Try *${prefix}menu* to see all commands.\n`;
      text += boxFooter();
      return reply(ctx, text);
    }

    const emoji = CATEGORY_EMOJI[cmd.category] || '📁';
    const usage = cmd.usage
      ? `${prefix}${cmd.usage}`
      : `${prefix}${cmd.name}`;

    let text = boxHeader(`ℹ️ HELP: ${cmd.name.toUpperCase()}`);
    text += `┃ ${emoji} Category : ${cmd.category.toUpperCase()}\n`;
    text += `┃ 📝 Usage    : ${usage}\n`;
    if (cmd.cooldown) {
      text += `┃ ⏱️ Cooldown : ${cmd.cooldown}s\n`;
    }

    // Flags
    const flags = [];
    if (cmd.ownerOnly) flags.push('👑 Owner only');
    if (cmd.groupOnly) flags.push('👥 Group only');
    if (cmd.privateOnly) flags.push('💬 Private only');
    if (cmd.adminOnly) flags.push('🛡️ Admin only');
    if (cmd.botAdminOnly) flags.push('🤖 Bot admin required');
    if (flags.length) {
      text += `┃ 🔒 Restrict : ${flags.join(', ')}\n`;
    }

    text += boxFooter() + `\n\n`;

    text += `📖 *Description*\n`;
    text += `┌────────────────────\n`;
    text += `│ ${cmd.description || 'No description.'}\n`;
    text += boxDividerEnd();

    if (cmd.aliases && cmd.aliases.length) {
      text += `\n🔗 *Aliases*\n`;
      text += `┌────────────────────\n`;
      for (const a of cmd.aliases) {
        text += `│ ${prefix}${a}\n`;
      }
      text += boxDividerEnd();
    }

    text += `\n_${config.bot.footer}_`;
    return reply(ctx, text);
  }
};
