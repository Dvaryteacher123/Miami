'use strict';

'use strict';

const ytdlp = require('youtube-dl-exec');

module.exports = {
    name: 'ytsearch',
    aliases: ['yts', 'searchsong'],
    category: 'media',
    description: 'Search YouTube and list the top 5 results',
    usage: '.ytsearch <name>',
    ownerOnly: false,
    groupOnly: false,
    privateOnly: false,
    adminOnly: false,
    botAdminOnly: false,
    cooldown: 0,

    async execute(ctx) {
        const { sock, msg, from, args } = ctx;
        const say = (text) => sock.sendMessage(from, { text }, { quoted: msg });
        const query = (args || []).join(' ').trim();

        if (!query) return say('❌ Usage: *.ytsearch <name>*');

        try {
            sock.sendPresenceUpdate('composing', from).catch(() => {});

            const res = await ytdlp('ytsearch5:' + query, {
                dumpSingleJson: true,
                flatPlaylist: true,
                noWarnings: true,
                quiet: true
            });

            const list = (res && res.entries) || [];
            if (!list.length) return say('❌ No results.');

            let text = '🔎 *YOUTUBE RESULTS*\n\n';
            list.slice(0, 5).forEach((v, i) => {
                const d = v.duration ? Math.floor(v.duration / 60) + ':' + String(Math.floor(v.duration % 60)).padStart(2, '0') : '--';
                text += (i + 1) + '. *' + (v.title || 'Untitled') + '*\n   ⏱ ' + d + '  •  https://youtu.be/' + v.id + '\n\n';
            });
            text += 'Download: *.ytmp3 <link>*  or  *.ytmp4 <link>*';

            return say(text);
        } catch (error) {
            return say('❌ Search failed. Try again later.');
        }
    }
};
