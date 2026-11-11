/**
 * COMMAND: search
 * Search the web (returns top results via DuckDuckGo)
 */

'use strict';

const axios = require('axios');
const config = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../config/config');
const logger = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/logger');

module.exports = {
  name: 'search',
  category: 'utility',
  aliases: ['google', 'ddg', 'web'],
  description: 'Search the web for information',
  usage: 'search <query>',
  cooldown: 8,

  async run(ctx, { reply, replyError }) {
    try {
      const query = ctx.query;

      if (!query) {
        let info = `╭━━━〔 *${config.bot.name.toUpperCase()}* 〕━━━\n`;
        info += `┃ 🔎 *WEB SEARCH*\n`;
        info += `┃\n`;
        info += `┃ Usage : ${ctx.prefix}search <query>\n`;
        info += `┃ Ex    : ${ctx.prefix}search Node.js tutorials\n`;
        info += `╰━━━━━━━━━━━━━━━━━━━━━\n\n`;
        info += `_${config.bot.footer}_`;
        return reply(ctx, info);
      }

      const res = await axios.get(
        'https://api.duckduckgo.com/',
        {
          params: {
            q: query,
            format: 'json',
            no_html: 1,
            skip_disambig: 1
          },
          timeout: 20000,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        }
      );

      const data = res.data || {};
      const abstract = data.AbstractText || '';
      const source = data.AbstractSource || '';
      const url = data.AbstractURL || '';
      const heading = data.Heading || query;

      const related = (data.RelatedTopics || [])
        .filter((t) => t.Text && (t.FirstURL || t.URL))
        .slice(0, 5);

      let text = `╭━━━〔 *${config.bot.name.toUpperCase()}* 〕━━━\n`;
      text += `┃ 🔎 *SEARCH RESULTS*\n`;
      text += `┃\n`;
      text += `┃ 🔍 Query : ${query.slice(0, 60)}\n`;
      text += `╰━━━━━━━━━━━━━━━━━━━━━\n`;

      if (abstract) {
        text += `\n📖 *${heading}*\n`;
        text += `┌────────────────────\n`;
        text += `│ ${abstract.slice(0, 700)}\n`;
        text += `└────────────────────\n`;
        if (source) text += `\n🌐 Source : ${source}\n`;
        if (url) text += `🔗 Link   : ${url}\n`;
      }

      if (related.length) {
        text += `\n🔗 *Related Topics*\n`;
        text += `┌────────────────────\n`;
        for (let i = 0; i < related.length; i++) {
          const r = related[i];
          text += `│ ${i + 1}. ${String(r.Text).slice(0, 100)}\n`;
          if (r.FirstURL) {
            text += `│    ${r.FirstURL}\n`;
          }
        }
        text += `└────────────────────\n`;
      }

      if (!abstract && !related.length) {
        text += `\n⚠️ No detailed results found.\n`;
        text += `Try: ${ctx.prefix}img ${query}\n`;
      }

      text += `\n_${config.bot.footer}_`;
      return reply(ctx, text);
    } catch (err) {
      logger.error(`[search] ${err.message}`);
      return replyError(ctx, `Search failed: ${err.message}`);
    }
  }
};
