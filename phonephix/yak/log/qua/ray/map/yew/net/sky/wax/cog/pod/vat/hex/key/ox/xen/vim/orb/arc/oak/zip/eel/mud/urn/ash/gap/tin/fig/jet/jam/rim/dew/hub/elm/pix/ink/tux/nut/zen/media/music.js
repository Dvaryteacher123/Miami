'use strict';
const yt = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/ytApi');
const logger = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/logger');
const axios = require('axios');

/* Download the file FIRST (with a time limit), then send the bytes.
   Sending a raw URL made the bot wait forever when the link was slow. */
async function getBuffer(url, maxMb = 60) {
    const res = await axios.get(url, {
        responseType: 'arraybuffer', timeout: 60000,
        maxContentLength: maxMb * 1024 * 1024, maxBodyLength: maxMb * 1024 * 1024,
        headers: { 'User-Agent': 'Mozilla/5.0 PHONEPHIX-BOT' }
    });
    const buf = Buffer.from(res.data);
    if (!buf.length) throw new Error('empty download');
    return buf;
}


module.exports = {
    name: 'play',
    category: 'media',
    aliases: ['song', 'music', 'audio', 'yt', 'mp3', 'ytmp3', 'yta', 'ytplay',
              'video', 'mp4', 'ytmp4', 'ytv', 'getmp3', 'getmp4'],
    description: 'Play songs / download YouTube audio and video',
    usage: '.play <song name> | .mp3 <link> | .video <name or link>',
    emoji: '🎵',
    cooldown: 5,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const prefix = ctx.prefix || '.';
        const raw = (ctx.commandName || ctx.command || ctx.cmd ||
            String(ctx.body || ctx.text || '').trim().split(/\s+/)[0].replace(/^[^\w]+/, '') || 'play').toLowerCase();

        const say = (text) => sock.sendMessage(from, { text }, { quoted: msg });
        const react = (e) => sock.sendMessage(from, { react: { text: e, key: msg.key } }).catch(() => {});

        let query = (Array.isArray(args) ? args.join(' ') : String(args || '')).trim();
        if (!query) {
            const q = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            query = (q?.conversation || q?.extendedTextMessage?.text || '').trim();
        }
        if (!query) {
            return say(
                '🎬 *YOUTUBE DOWNLOADER*\n\n' +
                `• ${prefix}play <song name>\n` +
                `• ${prefix}mp3 <youtube link>\n` +
                `• ${prefix}video <name or link>\n` +
                `• ${prefix}mp4 <youtube link>\n\n` +
                '_Replying to a link also works._'
            );
        }

        const isVideo = ['video', 'mp4', 'ytmp4', 'ytv', 'getmp4'].includes(raw);
        const isLinkAudio = ['mp3', 'ytmp3', 'yta', 'getmp3'].includes(raw);
        const url = yt.extractUrl(query);
        const clean = (t) => String(t || 'song').replace(/[\\/:*?"<>|]/g, '').slice(0, 80);

        try {
            if (isVideo) {
                await react('🎥');
                let link = url;
                if (!link) {
                    const list = await yt.search(query);
                    if (!list.length) return say('❌ No video found.');
                    link = list[0].link;
                    await sock.sendMessage(from, {
                        image: { url: list[0].imageUrl },
                        caption: `🎬 *${list[0].title}*\n⏱ ${list[0].duration || ''}\n\n⬇️ Downloading...`
                    }, { quoted: msg }).catch(() => {});
                }
                const v = await yt.mp4(link);
                await sock.sendMessage(from, {
                    video: await getBuffer(v.download_url, 80),
                    mimetype: 'video/mp4',
                    caption: '🎬 *Video downloaded*'
                }, { quoted: msg });
                return react('✅');
            }

            if (isLinkAudio || url) {
                if (!url) return say('❌ Invalid YouTube link.');
                await react('🎶');
                const a = await yt.mp3(url);
                await sock.sendMessage(from, {
                    audio: await getBuffer(a.mp3),
                    mimetype: 'audio/mpeg',
                    fileName: clean(a.title) + '.mp3',
                    contextInfo: { externalAdReply: {
                        title: a.title, body: '🎧 YouTube Audio',
                        thumbnailUrl: a.thumbnail, mediaType: 2, renderLargerThumbnail: true
                    } }
                }, { quoted: msg });
                return react('✅');
            }

            await react('📥');
            const p = await yt.play(query);
            await sock.sendMessage(from, {
                image: { url: p.thumbnail },
                caption: `🎶 *${p.title}*\n👤 ${p.author || ''}\n\n⬇️ Downloading...`
            }, { quoted: msg }).catch(() => {});
            await sock.sendMessage(from, {
                audio: await getBuffer(p.mp3),
                mimetype: 'audio/mpeg',
                fileName: clean(p.title) + '.mp3',
                contextInfo: { externalAdReply: {
                    title: p.title, body: p.author || '',
                    thumbnailUrl: p.thumbnail, mediaType: 2, renderLargerThumbnail: true
                } }
            }, { quoted: msg });
            await react('✅');
        } catch (e) {
            const why = (e && e.response && ('HTTP ' + e.response.status)) || (e && e.code) || (e && e.message) || e;
            logger.warn('[music] main API failed: ' + why);

            // BACKUP: your old music system (utils/musicKit.js) - audio only
            if (!isVideo) {
                try {
                    const kit = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/musicKit');
                    const track = await kit.fetchTrack(query, { isUrl: !!url });
                    await sock.sendMessage(from, {
                        audio: track.buffer,
                        mimetype: track.mime,
                        fileName: clean(track.title) + '.' + (track.ext || 'mp3')
                    }, { quoted: msg });
                    await say('🎵 *' + (track.title || query) + '*' + (track.artist ? '\n👤 ' + track.artist : '') +
                        (track.preview ? '\n\n⚠️ Only a 30-second preview was available.' : ''));
                    return react('✅');
                } catch (e2) {
                    logger.warn('[music] backup failed: ' + (e2 && e2.message || e2) + ' ' + JSON.stringify(e2 && e2.attempts || []).slice(0, 400));
                }
            }

            await react('❌');
            await say('❌ Could not get this one. The music server is busy, try again in a minute or use another song name.');
        }
    }
};
