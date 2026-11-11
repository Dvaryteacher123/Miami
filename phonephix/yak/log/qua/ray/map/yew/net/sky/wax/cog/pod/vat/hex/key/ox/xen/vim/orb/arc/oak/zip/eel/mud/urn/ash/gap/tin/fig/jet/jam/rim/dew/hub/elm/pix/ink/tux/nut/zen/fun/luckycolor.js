'use strict';

/**
 * .luckycolor - Your lucky color for today
 */

module.exports = {
    name: 'luckycolor',
    category: 'fun',
    aliases: [],
    description: "Your lucky color for today",
    usage: ".luckycolor [@user]",
    emoji: '🎨',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: String(t) }, { quoted: msg });
        const text = (args || []).join(' ').trim();
          const fk = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/funKit');
          const jid = fk.target(ctx);
          const colors = ['🔴 Red', '🟠 Orange', '🟡 Yellow', '🟢 Green', '🔵 Blue', '🟣 Purple', '🟤 Brown', '⚫ Black', '⚪ White', '🩷 Pink'];
          const c = colors[fk.seed(jid + fk.day() + 'color') % colors.length];
          return sock.sendMessage(from, { text: '🎨 *LUCKY COLOR TODAY*\n\n' + fk.tag(jid) + '\n' + c, mentions: [jid] }, { quoted: msg });
    }
};
