'use strict';

/**
 * .aura - Check your aura points for today
 */

module.exports = {
    name: 'aura',
    category: 'fun',
    aliases: [],
    description: "Check your aura points for today",
    usage: ".aura [@user]",
    emoji: '✨',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: String(t) }, { quoted: msg });
        const text = (args || []).join(' ').trim();
          const fk = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/funKit');
          const jid = fk.target(ctx);
          const n = fk.seed(jid + '|' + fk.day() + '|aura') % 101;
          const out = '✨ *AURA CHECK*\n\n' + fk.tag(jid) + '\n🔮 Aura today: *{n}/100*';
          return sock.sendMessage(from, { text: out.replace('{n}', n), mentions: [jid] }, { quoted: msg });
    }
};
