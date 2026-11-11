'use strict';

/**
 * .sigma - Check your sigma rating for today
 */

module.exports = {
    name: 'sigma',
    category: 'fun',
    aliases: [],
    description: "Check your sigma rating for today",
    usage: ".sigma [@user]",
    emoji: '🐺',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: String(t) }, { quoted: msg });
        const text = (args || []).join(' ').trim();
          const fk = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/funKit');
          const jid = fk.target(ctx);
          const n = fk.seed(jid + '|' + fk.day() + '|sigma') % 101;
          const out = '🐺 *SIGMA RATING*\n\n' + fk.tag(jid) + '\n🐺 Sigma rating: *{n}%*';
          return sock.sendMessage(from, { text: out.replace('{n}', n), mentions: [jid] }, { quoted: msg });
    }
};
