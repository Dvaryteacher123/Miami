'use strict';

/**
 * .rizz - Check your rizz level for today
 */

module.exports = {
    name: 'rizz',
    category: 'fun',
    aliases: [],
    description: "Check your rizz level for today",
    usage: ".rizz [@user]",
    emoji: '😎',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: String(t) }, { quoted: msg });
        const text = (args || []).join(' ').trim();
          const fk = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/funKit');
          const jid = fk.target(ctx);
          const n = fk.seed(jid + '|' + fk.day() + '|rizz') % 101;
          const out = '😎 *RIZZ METER*\n\n' + fk.tag(jid) + '\n💬 Rizz level: *{n}%*';
          return sock.sendMessage(from, { text: out.replace('{n}', n), mentions: [jid] }, { quoted: msg });
    }
};
