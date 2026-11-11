'use strict';

/**
 * .mydetails - Show your number, chat type and role
 */

module.exports = {
    name: 'mydetails',
    category: 'general',
    aliases: [],
    description: "Show your number, chat type and role",
    usage: ".mydetails",
    emoji: '🪪',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: String(t) }, { quoted: msg });
        const text = (args || []).join(' ').trim();
          const jid = String(ctx.senderJid || msg.key?.participant || msg.key?.remoteJid || '');
          const number = jid.split('@')[0].split(':')[0];
          const lines = [
            '🪪 *YOUR DETAILS*', '',
            '📱 Number: +' + number,
            '💬 Chat: ' + (ctx.isGroup ? 'Group' : 'Private'),
            ctx.isGroup ? '🆔 Group: ' + from : '',
            ctx.isGroupAdmin !== undefined ? '👑 Admin: ' + (ctx.isGroupAdmin ? 'Yes' : 'No') : '',
            ctx.isOwner !== undefined ? '⭐ Bot owner: ' + (ctx.isOwner ? 'Yes' : 'No') : ''
          ].filter((l, i) => l !== '' || i === 1);
          return reply(lines.join('\n'));
    }
};
