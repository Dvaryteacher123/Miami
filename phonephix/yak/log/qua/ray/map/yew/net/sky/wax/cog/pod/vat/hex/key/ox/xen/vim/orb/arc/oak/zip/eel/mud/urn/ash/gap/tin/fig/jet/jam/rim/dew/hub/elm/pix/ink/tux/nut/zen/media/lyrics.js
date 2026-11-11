'use strict';

const music = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/musicKit');

module.exports = {
    name: 'lyrics',
    aliases: ['lyric', 'songlyrics'],
    category: 'media',
    description: 'Get the lyrics of a song',
    usage: '.lyrics <song name / artist>',
    ownerOnly: false,
    cooldown: 5,

    async execute(ctx) {
        const { sock, msg, from, args } = ctx;
        const say = (text) => sock.sendMessage(from, { text }, { quoted: msg });
        const q = (args || []).join(' ').trim();
        if (!q) return say(`🎤 Usage: *${ctx.prefix || '.'}lyrics <song name / artist>*\nExample: ${ctx.prefix || '.'}lyrics Rema Calm Down`);

        try {
            const l = await music.lyrics(q);
            const header = `🎤 *${l.title}*\n👤 ${l.artist}\n\n`;
            const body = l.text.length > 3500 ? l.text.slice(0, 3500) + '\n\n…' : l.text;
            return say(header + body);
        } catch (e) {
            return say(e.notFound ? '❌ No lyrics found. Try adding the artist name.' : '❌ Lyrics service is busy. Try again in a minute.');
        }
    }
};
