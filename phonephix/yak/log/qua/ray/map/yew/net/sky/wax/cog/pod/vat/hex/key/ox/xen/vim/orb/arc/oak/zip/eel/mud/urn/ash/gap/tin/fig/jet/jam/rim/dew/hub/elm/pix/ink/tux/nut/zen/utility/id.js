/**
 * COMMAND: id
 * Type "id" (with or without the prefix) -> shows the ID of the chat.
 * In a group it shows the GROUP ID. Reply to / mention someone to also get their ID.
 */

'use strict';

const num = (jid) => String(jid || '').split(':')[0].split('@')[0];

module.exports = {
  name: 'id',
  category: 'utility',
  aliases: ['jid', 'chatid'],
  description: 'Show the group / chat ID (works without prefix too)',
  usage: 'id',
  emoji: '🆔',
  cooldown: 0,

  async execute(ctx) {
    const { sock, from, msg } = ctx;
    const send = (text, mentions) =>
      sock.sendMessage(from, mentions ? { text, mentions } : { text }, { quoted: msg });

    try {
      const info =
        msg.message?.extendedTextMessage?.contextInfo ||
        msg.message?.imageMessage?.contextInfo ||
        msg.message?.videoMessage?.contextInfo || {};

      let out = '';

      if (ctx.isGroup) {
        let name = '';
        let size = 0;
        try {
          const meta = await sock.groupMetadata(from);
          name = meta.subject || '';
          size = (meta.participants || []).length;
        } catch (_) {}

        out += `🆔 *GROUP ID*\n\n${from}\n`;
        if (name) out += `\n📛 Name: ${name}`;
        if (size) out += `\n👥 Members: ${size}`;
      } else if (String(from).endsWith('@newsletter')) {
        out += `🆔 *CHANNEL ID*\n\n${from}`;
      } else {
        out += `🆔 *CHAT ID*\n\n${from}\n\n📞 Number: +${num(from)}`;
      }

      out += `\n\n👤 *You:* ${ctx.senderJid || ''}`;

      const mentioned = Array.isArray(info.mentionedJid) ? info.mentionedJid : [];
      const quoted = info.participant || '';
      const others = [...new Set([quoted, ...mentioned].filter(Boolean))];
      for (const j of others.slice(0, 5)) {
        out += `\n🎯 *Target:* ${j}`;
      }

      return await send(out);
    } catch (err) {
      return send(`❌ ID lookup failed: ${err.message}`);
    }
  }
};
