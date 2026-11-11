'use strict';

const music = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/musicKit');

const fmt = (s) => (s ? Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') : '');

module.exports = {
    name: 'songsearch',
    aliases: ['findsong', 'musicsearch', 'trackinfo'],
    category: 'media',
    description: 'Search songs and see the top results',
    usage: '.songsearch <song or artist>',
    ownerOnly: false,
    cooldown: 5,

    async execute(ctx) {
        const { sock, msg, from, args } = ctx;
        const p = ctx.prefix || '.';
        const say = (text) => sock.sendMessage(from, { text }, { quoted: msg });
        const q = (args || []).join(' ').trim();
        if (!q) return say(`🔎 Usage: *${p}songsearch <song or artist>*`);

        const rows = await music.searchList(q, 8);
        if (!rows.length) return say('❌ No songs found.');

        const lines = rows.map((r, i) => `${i + 1}. *${r.title}* — ${r.artist}${r.duration ? ' (' + fmt(r.duration) + ')' : ''}`);
        return say(`🎶 *RESULTS FOR "${q}"*\n\n${lines.join('\n')}\n\nGet one with: ${p}play <artist> <title>`);
    }
};
