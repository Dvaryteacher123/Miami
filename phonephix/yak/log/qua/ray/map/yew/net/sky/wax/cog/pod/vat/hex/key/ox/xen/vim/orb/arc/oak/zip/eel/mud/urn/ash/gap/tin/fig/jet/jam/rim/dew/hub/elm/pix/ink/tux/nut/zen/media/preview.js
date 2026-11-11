'use strict';

const music = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/musicKit');

module.exports = {
    name: 'preview',
    aliases: ['songpreview', 'snippet'],
    category: 'media',
    description: 'Get a quick 30-second preview of a song',
    usage: '.preview <song name>',
    ownerOnly: false,
    cooldown: 5,

    async execute(ctx) {
        const { sock, msg, from, args } = ctx;
        const say = (text) => sock.sendMessage(from, { text }, { quoted: msg });
        const q = (args || []).join(' ').trim();
        if (!q) return say(`🎧 Usage: *${ctx.prefix || '.'}preview <song name>*`);

        try {
            const t = await music.PROVIDERS.deezer.get(q);
            await sock.sendMessage(from, { audio: t.buffer, mimetype: 'audio/mpeg', fileName: (t.title || 'preview') + '.mp3' }, { quoted: msg });
            return say(`🎧 *${t.title}* — ${t.artist}\n_30-second preview_`);
        } catch (e) {
            return say(e.notFound ? '❌ No preview found for that song.' : '❌ Preview service is busy. Try again in a minute.');
        }
    }
};
