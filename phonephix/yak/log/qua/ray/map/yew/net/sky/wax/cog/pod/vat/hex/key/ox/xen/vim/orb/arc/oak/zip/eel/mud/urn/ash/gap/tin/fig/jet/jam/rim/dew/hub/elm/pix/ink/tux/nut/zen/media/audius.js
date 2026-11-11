'use strict';

const axios = require('axios');

const APP_NAME = 'PHONEPHIX-BOT';

module.exports = {
    name: 'audius',

    aliases: ['audiusmusic'],

    category: 'media',

    description: 'Search and play music',

    usage: '.music <song name>',

    ownerOnly: false,
    groupOnly: false,
    privateOnly: false,
    adminOnly: false,
    botAdminOnly: false,

    cooldown: 0,

    async run(ctx) {
        const { sock, msg, from, args } = ctx;

        try {
            // ==========================================
            // GET SEARCH QUERY
            // ==========================================

            const query = Array.isArray(args)
                ? args.join(' ').trim()
                : String(args || '').trim();

            if (!query) {
                return await sock.sendMessage(
                    from,
                    {
                        text:
                            '🎵 *PHONEPHIX MUSIC*\n\n' +
                            'Enter the name of a song or artist.\n\n' +
                            '*Examples:*\n' +
                            '`.music Diamond Platnumz`\n' +
                            '`.music Adele Hello`\n' +
                            '`.play Calm Down`\n\n' +
                            '*Aliases:*\n' +
                            '`.song`\n' +
                            '`.play`\n' +
                            '`.audio`\n' +
                            '`.mp3`'
                    },
                    { quoted: msg }
                );
            }

            // ==========================================
            // SEARCHING MESSAGE
            // ==========================================

            await sock.sendMessage(
                from,
                {
                    text:
                        '🔎 *Searching music...*\n\n' +
                        `🎵 ${query}`
                },
                { quoted: msg }
            );

            // ==========================================
            // GET AUDIUS DISCOVERY NODES
            // ==========================================

            const nodesResponse = await axios.get(
                'https://api.audius.co',
                {
                    timeout: 15000,
                    headers: {
                        'User-Agent': 'PHONEPHIX-BOT/1.0'
                    }
                }
            );

            let nodes =
                nodesResponse?.data?.data || [];

            if (!Array.isArray(nodes) || !nodes.length) {
                throw new Error(
                    'No Audius discovery nodes available.'
                );
            }

            // Randomize nodes so one dead node doesn't
            // break the command every time.
            nodes = nodes
                .filter(Boolean)
                .sort(() => Math.random() - 0.5);

            // ==========================================
            // SEARCH TRACK
            // ==========================================

            let selectedTrack = null;
            let selectedHost = null;

            for (const host of nodes.slice(0, 5)) {
                try {
                    const cleanHost =
                        String(host).replace(/\/+$/, '');

                    const searchResponse =
                        await axios.get(
                            `${cleanHost}/v1/tracks/search`,
                            {
                                params: {
                                    query,
                                    app_name: APP_NAME,
                                    limit: 10
                                },

                                timeout: 15000,

                                headers: {
                                    Accept:
                                        'application/json',
                                    'User-Agent':
                                        'PHONEPHIX-BOT/1.0'
                                }
                            }
                        );

                    const tracks =
                        searchResponse?.data?.data || [];

                    if (
                        !Array.isArray(tracks) ||
                        !tracks.length
                    ) {
                        continue;
                    }

                    // Only choose tracks that can actually
                    // be streamed.
                    const playable =
                        tracks.filter(track =>
                            track &&
                            track.id &&
                            track.is_streamable !== false
                        );

                    if (!playable.length) {
                        continue;
                    }

                    // Prefer tracks that have reasonable
                    // duration.
                    const normalTracks =
                        playable.filter(track =>
                            Number(track.duration || 0) >= 20
                        );

                    const candidates =
                        normalTracks.length
                            ? normalTracks
                            : playable;

                    selectedTrack =
                        candidates[0];

                    selectedHost =
                        cleanHost;

                    break;

                } catch (searchError) {
                    console.log(
                        `[AUDIUS] Node failed: ${host}`,
                        searchError?.message
                    );
                }
            }

            // ==========================================
            // NO TRACK
            // ==========================================

            if (!selectedTrack || !selectedHost) {
                return await sock.sendMessage(
                    from,
                    {
                        text:
                            '❌ *Music not found.*\n\n' +
                            `Search: ${query}\n\n` +
                            'Try another song or artist.'
                    },
                    { quoted: msg }
                );
            }

            // ==========================================
            // TRACK INFORMATION
            // ==========================================

            const trackId =
                selectedTrack.id;

            const title =
                selectedTrack.title ||
                'Unknown Song';

            const artist =
                selectedTrack.user?.name ||
                'Unknown Artist';

            const duration =
                formatDuration(
                    selectedTrack.duration
                );

            const artwork =
                selectedTrack.artwork?.['480x480'] ||
                selectedTrack.artwork?.['1000x1000'] ||
                selectedTrack.artwork?.['150x150'] ||
                null;

            // ==========================================
            // CREATE STREAM URL
            // ==========================================

            const streamUrl =
                `${selectedHost}/v1/tracks/` +
                `${encodeURIComponent(trackId)}/stream` +
                `?app_name=${encodeURIComponent(APP_NAME)}`;

            console.log(
                '[AUDIUS STREAM]',
                streamUrl
            );

            // ==========================================
            // CHECK STREAM FIRST
            // ==========================================

            const streamCheck =
                await axios.get(
                    streamUrl,
                    {
                        responseType: 'arraybuffer',

                        timeout: 90000,

                        maxContentLength:
                            25 * 1024 * 1024,

                        maxBodyLength:
                            25 * 1024 * 1024,

                        headers: {
                            'User-Agent':
                                'PHONEPHIX-BOT/1.0',
                            Accept:
                                'audio/mpeg,audio/*,*/*'
                        },

                        validateStatus: status =>
                            status >= 200 &&
                            status < 400
                    }
                );

            const audioBuffer =
                Buffer.from(
                    streamCheck.data
                );

            if (
                !audioBuffer ||
                audioBuffer.length < 10000
            ) {
                throw new Error(
                    'Audius returned an invalid or empty audio file.'
                );
            }

            // ==========================================
            // SEND SONG INFO
            // ==========================================

            const caption =
                `╭━━━〔 🎵 PHONEPHIX MUSIC 〕━━━╮\n` +
                `┃\n` +
                `┃ 🎵 Title: ${title}\n` +
                `┃ 👤 Artist: ${artist}\n` +
                `┃ ⏱️ Duration: ${duration}\n` +
                `┃\n` +
                `┃ 🌐 Source: Audius\n` +
                `┃\n` +
                `╰━━━━━━━━━━━━━━━━━━━━╯`;

            if (artwork) {
                try {
                    await sock.sendMessage(
                        from,
                        {
                            image: {
                                url: artwork
                            },
                            caption
                        },
                        {
                            quoted: msg
                        }
                    );
                } catch (_) {
                    await sock.sendMessage(
                        from,
                        {
                            text: caption
                        },
                        {
                            quoted: msg
                        }
                    );
                }
            } else {
                await sock.sendMessage(
                    from,
                    {
                        text: caption
                    },
                    {
                        quoted: msg
                    }
                );
            }

            // ==========================================
            // SEND AUDIO
            // ==========================================

            await sock.sendMessage(
                from,
                {
                    audio: audioBuffer,
                    mimetype: 'audio/mpeg',
                    fileName:
                        `${safeFileName(title)}.mp3`,
                    ptt: false
                },
                {
                    quoted: msg
                }
            );

        } catch (error) {
            console.error(
                '[MUSIC ERROR]',
                error?.response?.data ||
                error?.message ||
                error
            );

            let message =
                '❌ *Failed to play the music.*';

            if (
                error?.code ===
                    'ECONNABORTED' ||
                error?.code ===
                    'ETIMEDOUT'
            ) {
                message +=
                    '\n\n⏱️ Music server took too long to respond.';
            } else if (
                error?.response?.status === 404
            ) {
                message +=
                    '\n\n🔍 Audio stream was not found.';
            } else if (
                error?.response?.status === 403
            ) {
                message +=
                    '\n\n🚫 This track cannot be streamed.';
            } else if (
                error?.response?.status === 429
            ) {
                message +=
                    '\n\n⚠️ Too many requests. Try again later.';
            } else if (error?.message) {
                message +=
                    `\n\n${error.message}`;
            }

            await sock.sendMessage(
                from,
                {
                    text: message
                },
                {
                    quoted: msg
                }
            );
        }
    }
};

// ==========================================
// HELPERS
// ==========================================

function formatDuration(seconds) {
    const value =
        Math.floor(Number(seconds));

    if (
        !Number.isFinite(value) ||
        value < 0
    ) {
        return 'Unknown';
    }

    const minutes =
        Math.floor(value / 60);

    const remaining =
        value % 60;

    return (
        `${minutes}:` +
        String(remaining).padStart(2, '0')
    );
}

function safeFileName(name) {
    return String(name)
        .replace(/[\\/:*?"<>|]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 80) || 'music';
                      }
