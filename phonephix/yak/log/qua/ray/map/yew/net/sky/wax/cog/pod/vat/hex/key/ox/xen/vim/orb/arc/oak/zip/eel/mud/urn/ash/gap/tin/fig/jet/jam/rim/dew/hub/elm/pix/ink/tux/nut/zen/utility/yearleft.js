'use strict';

/**
 * .yearleft - How much of this year is left
 */

module.exports = {
    name: 'yearleft',
    category: 'utility',
    aliases: [],
    description: "How much of this year is left",
    usage: ".yearleft",
    emoji: '📆',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: String(t) }, { quoted: msg });
        const text = (args || []).join(' ').trim();
          const tz = process.env.BOT_TIMEZONE || 'Africa/Dar_es_Salaam';
          let ymd;
          try { ymd = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date()); } catch (_) { ymd = new Date().toISOString().slice(0, 10); }
          const [y, m, d] = ymd.split('-').map(Number);
          const start = Date.UTC(y, 0, 1), end = Date.UTC(y + 1, 0, 1), today = Date.UTC(y, m - 1, d);
          const total = Math.round((end - start) / 86400000);
          const passed = Math.round((today - start) / 86400000) + 1;
          const left = total - passed;
          const pct = ((passed / total) * 100).toFixed(1);
          const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));
          return reply('📆 *YEAR ' + y + '*\n\n' + bar + ' ' + pct + '%\n\n✅ Day ' + passed + ' of ' + total + '\n⏳ Days left: ' + left + '\n🗓️ Weeks left: ' + (left / 7).toFixed(1));
    }
};
