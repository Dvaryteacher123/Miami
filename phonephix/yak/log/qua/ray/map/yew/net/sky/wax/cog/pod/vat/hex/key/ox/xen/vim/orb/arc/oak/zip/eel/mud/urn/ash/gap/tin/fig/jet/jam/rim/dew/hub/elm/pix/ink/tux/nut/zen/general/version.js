/**
 * COMMAND: version
 * Show bot version and changelog
 */

'use strict';

const config = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../config/config');

module.exports = {
  name: 'version',
  category: 'general',
  aliases: ['v', 'ver'],
  description: 'Show bot version and build info',
  usage: 'version',
  cooldown: 5,

  async run(ctx, { reply }) {
    let text = `╭━━━〔 *${config.bot.name.toUpperCase()}* 〕━━━\n`;
    text += `┃ 🧩 *VERSION INFO*\n`;
    text += `┃\n`;
    text += `┃ 📦 Version  : ${config.bot.version}\n`;
    text += `┃ 🌐 Node.js  : ${process.version}\n`;
    text += `┃ 💻 Platform : ${process.platform}\n`;
    text += `┃ 🏗️ Build    : Stable\n`;
    text += `┃ 👤 Author   : ${config.bot.owner}\n`;
    text += `╰━━━━━━━━━━━━━━━━━━━━━\n\n`;

    text += `✨ *HIGHLIGHTS*\n`;
    text += `┌────────────────────\n`;
    text += `│ 🔌 Multi-user sessions\n`;
    text += `│ 💾 MongoDB auth storage\n`;
    text += `│ 🌐 Web pairing panel\n`;
    text += `│ ⚡ Real-time updates\n`;
    text += `│ 🛡️ Rate limiting + bans\n`;
    text += `└────────────────────\n`;

    text += `\n_${config.bot.footer}_`;
    return reply(ctx, text);
  }
};
