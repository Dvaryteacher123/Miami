'use strict';

const logger = require('../utils/logger');
const Setting = require('../database/models/Setting');


/*
|--------------------------------------------------------------------------
| CHECK AUTO STATUS
|--------------------------------------------------------------------------
*/

async function isAutoStatusEnabled(
    sessionId,
    userId
) {

    try {

        const settings =
            await Setting.getOrCreate(
                sessionId,
                userId
            );

        return (
            settings?.metadata?.autoStatus === true
        );

    } catch (error) {

        logger?.warn?.(
            '[AUTO STATUS SETTINGS ERROR]',
            error?.message || error
        );

        return false;
    }
}


/*
|--------------------------------------------------------------------------
| VIEW STATUS
|--------------------------------------------------------------------------
*/

async function viewStatus(
    sock,
    statusMessage
) {

    try {

        if (!sock) {
            return false;
        }

        if (!statusMessage) {
            return false;
        }


        const key =
            statusMessage.key ||
            statusMessage;


        if (!key) {
            return false;
        }


        /*
        |--------------------------------------------------------------------------
        | STATUS MESSAGE MUST BE BROADCAST
        |--------------------------------------------------------------------------
        */

        const remoteJid =
            key.remoteJid;


        if (
            remoteJid !==
            'status@broadcast'
        ) {
            return false;
        }


        /*
        |--------------------------------------------------------------------------
        | MARK AS READ / VIEWED
        |--------------------------------------------------------------------------
        |
        | Baileys versions differ.
        | Try readMessages first.
        |
        */

        if (
            typeof sock.readMessages ===
            'function'
        ) {

            try {

                await sock.readMessages([
                    key
                ]);

                return true;

            } catch (error) {

                logger?.warn?.(
                    '[STATUS READ ERROR]',
                    error?.message || error
                );
            }
        }


        /*
        |--------------------------------------------------------------------------
        | FALLBACK
        |--------------------------------------------------------------------------
        */

        if (
            typeof sock.chatModify ===
            'function'
        ) {

            try {

                await sock.chatModify(
                    {
                        markRead: [
                            key
                        ]
                    },
                    'status@broadcast'
                );

                return true;

            } catch (error) {

                logger?.warn?.(
                    '[STATUS CHAT MODIFY ERROR]',
                    error?.message || error
                );
            }
        }


        return false;

    } catch (error) {

        logger?.warn?.(
            '[STATUS VIEW ERROR]',
            error?.message || error
        );

        return false;
    }
}


/*
|--------------------------------------------------------------------------
| SETTINGS (view + like)
|--------------------------------------------------------------------------
*/

async function getStatusSettings(sessionId, userId) {
    try {
        const settings = await Setting.getOrCreate(sessionId, userId);
        return {
            view: settings?.metadata?.autoStatus === true,
            like: settings?.metadata?.autoStatusLike === true
        };
    } catch (_) {
        return { view: false, like: false };
    }
}

const LIKE_EMOJIS = String(process.env.STATUS_LIKE_EMOJIS || '💚,❤️,🔥,😍,👏,💯,😊,🙌')
    .split(',').map((e) => e.trim()).filter(Boolean);

const hasContent = (m) => {
    const c = m?.message;
    if (!c) return false;
    return !!(c.imageMessage || c.videoMessage || c.extendedTextMessage || c.conversation ||
        c.audioMessage || c.ephemeralMessage || c.viewOnceMessage || c.viewOnceMessageV2);
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** React (like) to a status. Needs the poster's JID + our own JID in statusJidList. */
async function likeStatus(sock, message) {
    try {
        const key = message?.key;
        if (!key || key.fromMe) return false;

        const poster = key.participantPn || key.participant || message.participant;
        if (!poster) return false;

        const me = String(sock?.user?.id || '').replace(/:\d+@/, '@');
        const emoji = LIKE_EMOJIS[Math.floor(Math.random() * LIKE_EMOJIS.length)] || '💚';

        await sock.sendMessage(
            'status@broadcast',
            { react: { key, text: emoji } },
            { statusJidList: [poster, me].filter(Boolean) }
        );
        return true;
    } catch (error) {
        logger?.warn?.('[STATUS LIKE ERROR]', error?.message || error);
        return false;
    }
}

/*
|--------------------------------------------------------------------------
| HANDLE STATUS UPDATE
|--------------------------------------------------------------------------
*/

async function handleStatusUpdate({
    sock,
    messages,
    sessionId,
    userId
}) {

    if (!sock) {
        return;
    }


    /*
    |--------------------------------------------------------------------------
    | CHECK SETTING
    |--------------------------------------------------------------------------
    */

    const cfg = await getStatusSettings(sessionId, userId);

    // liking a status only works after viewing it, so "like" also views
    if (!cfg.view && !cfg.like) {
        return;
    }


    /*
    |--------------------------------------------------------------------------
    | NORMALIZE MESSAGES
    |--------------------------------------------------------------------------
    */

    let list = [];


    if (
        Array.isArray(messages)
    ) {

        list = messages;

    } else if (
        Array.isArray(
            messages?.messages
        )
    ) {

        list =
            messages.messages;

    } else if (
        messages
    ) {

        list = [
            messages
        ];
    }


    /*
    |--------------------------------------------------------------------------
    | VIEW EACH STATUS
    |--------------------------------------------------------------------------
    */

    for (
        const message of list
    ) {

        try {

            const key =
                message?.key;


            if (
                key?.remoteJid !==
                'status@broadcast'
            ) {
                continue;
            }


            if (key.fromMe || !hasContent(message)) {
                continue;
            }

            // small human-like pause (also avoids bursts when many statuses arrive)
            await sleep(1500 + Math.floor(Math.random() * 3500));

            const viewed =
                await viewStatus(
                    sock,
                    message
                );


            if (viewed) {

                logger?.info?.(
                    `[AUTO STATUS] Viewed status for session ${sessionId}`
                );
            }

            if (cfg.like) {
                await sleep(800 + Math.floor(Math.random() * 1700));
                const liked = await likeStatus(sock, message);
                if (liked) {
                    logger?.info?.(`[AUTO STATUS] Liked status for session ${sessionId}`);
                }
            }

        } catch (error) {

            logger?.warn?.(
                '[AUTO STATUS MESSAGE ERROR]',
                error?.message || error
            );
        }
    }
}


module.exports = {
    isAutoStatusEnabled,
    getStatusSettings,
    likeStatus,
    viewStatus,
    handleStatusUpdate
};
