/**
 * COMMAND: setprefix
 * Change the command prefix for this session
 */

'use strict';

const config = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../config/config');
const logger = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/logger');
const Setting = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../database/models/Setting');

module.exports = {
  name: 'setprefix',
  category: 'owner',
  aliases: ['prefix', 'changeprefix'],
  description: 'Change the command prefix',
  usage: 'setprefix <new prefix>',
  ownerOnly: true,
  cooldown: 5,

  async run(ctx, { reply, replyError }) {
    try {
      const newPrefix = ctx.args[0];

      if (!newPrefix) {
        let info = `╭━━━〔 *${config.bot.name.toUpperCase()}* 〕━━━\n`;
        info += `┃ ⚙️ *SET PREFIX*\n`;
        info += `┃\n`;
        info += `┃ Current : ${ctx.prefix}\n`;
        info += `┃ Usage   : ${ctx.prefix}setprefix <new>\n`;
        info += `┃ Ex      : ${ctx.prefix}setprefix !\n`;
        info += `┃         : ${ctx.prefix}setprefix /\n`;
        info += `╰━━━━━━━━━━━━━━━━━━━━━\n\n`;
        info += `_${config.bot.footer}_`;
        return reply(ctx, info);
      }

      if (newPrefix.length > 3) {
        return replyError(ctx, 'Prefix must be 1-3 characters long.');
      }

      if (/\s/.test(newPrefix)) {
        return replyError(ctx, 'Prefix cannot contain spaces.');
      }

      const settings = await Setting.getOrCreate(ctx.sessionId, ctx.userId);
      const oldPrefix = settings.prefix || config.bot.defaultPrefix;

      settings.prefix = newPrefix;
      await settings.save();

      let text = `╭━━━〔 *${config.bot.name.toUpperCase()}* 〕━━━\n`;
      text += `┃ ⚙️ *PREFIX UPDATED*\n`;
      text += `┃\n`;
      text += `┃ 📤 Old : ${oldPrefix}\n`;
      text += `┃ 📥 New : ${newPrefix}\n`;
      text += `┃\n`;
      text += `┃ 💡 Try : ${newPrefix}menu\n`;
      text += `╰━━━━━━━━━━━━━━━━━━━━━\n\n`;
      text += `_${config.bot.footer}_`;
      return reply(ctx, text);
    } catch (err) {
      logger.error(`[setprefix] ${err.message}`);
      return replyError(ctx, `Set prefix failed: ${err.message}`);
    }
  }
};
