'use strict';

/**
 * .luckyday - Find your luckiest day of the week
 */

module.exports = {
    name: 'luckyday',
    category: 'fun',
    aliases: [],
    description: "Find your luckiest day of the week",
    usage: ".luckyday [@user]",
    emoji: '📅',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: String(t) }, { quoted: msg });
        const text = (args || []).join(' ').trim();
          const fk = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/funKit');
          const jid = fk.target(ctx);
          const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          const d = days[fk.seed(jid + 'luckyday') % 7];
          return sock.sendMessage(from, { text: '📅 *LUCKIEST DAY*\n\n' + fk.tag(jid) + '\nYour lucky day is *' + d + '*', mentions: [jid] }, { quoted: msg });
    }
};
