'use strict';

const music = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/musicKit');

module.exports = {
    name: 'musiccheck',
    aliases: ['musicstatus', 'checkmusic'],
    category: 'media',
    description: 'Owner: test which music sources work on this server',
    usage: '.musiccheck',
    ownerOnly: true,
    cooldown: 20,

    async execute(ctx) {
        const { sock, msg, from } = ctx;
        const say = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        await say('🧪 Testing all music sources, this takes up to a minute...');
        const rows = await music.diagnose('Calm Down Rema');

        const lines = rows.map((r) =>
            `${r.ok ? '✅' : '❌'} *${r.label}* (${(r.ms / 1000).toFixed(1)}s)\n   ${r.ok ? r.info : r.info}`);
        return say(`🎵 *MUSIC SOURCES*\n\n${lines.join('\n\n')}\n\nOrder used: ${music.ORDER.join(' → ')}`);
    }
};
