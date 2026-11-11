'use strict';

const config = require('../config/config');
const logger = require('../utils/logger');

const Setting = require('../database/models/Setting');
const Ban = require('../database/models/Ban');
const Session = require('../database/models/Session');

const { runCommand } = require('../phonephix/index');

// PHONEPHIX V2 hot-path caches: reduce repeated MongoDB reads.
const SESSION_PHONE_CACHE = new Map();
const SETTINGS_CACHE = new Map();
const CACHE_TTL = 60 * 1000;

function getCached(cache, key) {
    const item = cache.get(key);
    if (!item) return null;
    if (item.expiresAt <= Date.now()) { cache.delete(key); return null; }
    return item.value;
}

// Called by commands (e.g. .autotyping) after saving settings so the change applies immediately
function invalidateSettingsCache(sessionId) {
    SETTINGS_CACHE.delete(String(sessionId));
}

function setCached(cache, key, value, ttl = CACHE_TTL) {
    cache.set(key, { value, expiresAt: Date.now() + ttl });
    if (cache.size > 2000) {
        const first = cache.keys().next().value;
        if (first !== undefined) cache.delete(first);
    }
    return value;
}


/*
|--------------------------------------------------------------------------
| PUBLIC COMMANDS
|--------------------------------------------------------------------------
*/

const PUBLIC_COMMANDS = new Set([
    'pair',
    'menu',
    'help',
    'ping',
    'alive',
    'owner',
    'about',
    'getpp',
    'tagall',
    'repeat',
    'botinfo',
    'quote',
    'weather',
    'time',
    'calc',
    'shorturl',
    'define',
    'base64',
    'encode',
    'decode',
    'password',
    'qr',
    'sticker',
    'toimage',
    'toaudio',
    'thumbnail',
    'reverse',
    'audio',
    'meme',
    'deleted',
    'url'
]);


/*
|--------------------------------------------------------------------------
| GROUP ADMIN COMMANDS
|--------------------------------------------------------------------------
*/

const GROUP_ADMIN_COMMANDS = new Set([
    'antilink',
    'nolink',
    'antilinks',
    'antimention',
    'antistatus',
    'antigroupstatus',
    'antitagstatus',
    'nostatus',
    'mute',
    'unmute',
    'kick',
    'add',
    'promote',
    'demote',
    'hidetag',
    'setname',
    'setdesc',
    'group',
    'close',
    'open',
    'delete',
    'link',
    'admins',
    'welcome',
    'goodbye'
]);


/*
|--------------------------------------------------------------------------
| OWNER COMMANDS
|--------------------------------------------------------------------------
|
| mode haipo hapa.
| .mode inahitaji session owner.
|
*/

const OWNER_COMMANDS = new Set([
    'sessions',
    'restart',
    'broadcast',
    'shutdown',
    'eval',
    'exec',
    'setprefix',
    'ban',
    'unban',
    'block',
    'unblock',
    'kill'
]);


/*
|--------------------------------------------------------------------------
| TEXT EXTRACTION
|--------------------------------------------------------------------------
*/

function extractText(msg) {

    if (!msg?.message) {
        return '';
    }

    const message = msg.message;

    return (
        message.conversation ||
        message.extendedTextMessage?.text ||
        message.imageMessage?.caption ||
        message.videoMessage?.caption ||
        message.documentMessage?.caption ||
        message.buttonsResponseMessage?.selectedButtonId ||
        message.listResponseMessage?.singleSelectReply?.selectedRowId ||
        message.templateButtonReplyMessage?.selectedId ||
        message.interactiveResponseMessage
            ?.nativeFlowResponseMessage
            ?.paramsJson ||
        ''
    );
}


function unwrapMessage(message) {
    let m = message;
    for (let i = 0; i < 5 && m; i++) {
        const inner =
            m.ephemeralMessage?.message ||
            m.viewOnceMessage?.message ||
            m.viewOnceMessageV2?.message ||
            m.viewOnceMessageV2Extension?.message ||
            m.documentWithCaptionMessage?.message ||
            m.editedMessage?.message?.protocolMessage?.editedMessage ||
            m.editedMessage?.message ||
            null;
        if (!inner) break;
        m = inner;
    }
    return m || {};
}

// Maandishi yote yanayoweza kuwa na link (pamoja na caption, preview, edited)
function extractLinkText(msg) {
    if (!msg?.message) return '';
    const m = unwrapMessage(msg.message);
    const parts = [
        m.conversation,
        m.extendedTextMessage?.text,
        m.extendedTextMessage?.matchedText,
        m.extendedTextMessage?.canonicalUrl,
        m.imageMessage?.caption,
        m.videoMessage?.caption,
        m.documentMessage?.caption,
        m.groupInviteMessage ? 'chat.whatsapp.com/' + (m.groupInviteMessage.inviteCode || '') : ''
    ];
    return parts.filter(Boolean).join(' ') || extractText(msg);
}


/*
|--------------------------------------------------------------------------
| JID HELPERS
|--------------------------------------------------------------------------
*/

function normalizeJid(jid) {

    if (!jid) {
        return '';
    }

    return String(jid)
        .trim()
        .replace(/^whatsapp:/i, '');
}


function phoneFromJid(jid) {

    const normalized =
        normalizeJid(jid);

    if (!normalized) {
        return '';
    }

    return normalized
        .split(':')[0]
        .split('@')[0]
        .replace(/[^\d]/g, '');
}


function isGroupJid(jid) {

    return normalizeJid(jid)
        .endsWith('@g.us');
}


function isStatusJid(jid) {

    return normalizeJid(jid) ===
        'status@broadcast';
}


/*
|--------------------------------------------------------------------------
| COMMAND PARSER
|--------------------------------------------------------------------------
*/

function parseCommand(
    text,
    prefix = '.'
) {

    const value =
        String(text || '').trim();

    if (
        !value ||
        !value.startsWith(prefix)
    ) {
        return null;
    }

    const body =
        value
            .slice(prefix.length)
            .trim();

    if (!body) {
        return null;
    }

    const parts =
        body.split(/\s+/);

    const command =
        String(parts.shift() || '')
            .toLowerCase()
            .trim();

    return {
        command,
        args: parts,
        query: parts.join(' ')
    };
}


/*
|--------------------------------------------------------------------------
| SESSION OWNER
|--------------------------------------------------------------------------
|
| Tunajaribu kutambua:
|
| 1. sock.user.id
| 2. sock.user.jid
| 3. sock.user.phone
| 4. sock.user.number
| 5. sessionId kama ina namba
|
*/

function isSessionOwner(
    senderJid,
    sock,
    sessionId,
    sessionPhoneNumber = ''
) {

    const senderPhone =
        phoneFromJid(senderJid);

    if (!senderPhone) {
        return false;
    }

    // MongoDB stores the real WhatsApp phone used to pair this session.
    // This is important because newer WhatsApp accounts may expose a LID
    // in sock.user.id instead of the normal phone JID.
    const pairedPhone =
        String(sessionPhoneNumber || '').replace(/[^\d]/g, '');

    if (pairedPhone && senderPhone === pairedPhone) {
        return true;
    }


    /*
    |--------------------------------------------------------------------------
    | BOT ACCOUNT IDENTITIES
    |--------------------------------------------------------------------------
    */

    const possibleIds = [
        sock?.user?.id,
        sock?.user?.jid,
        sock?.user?.phone,
        sock?.user?.number
    ];


    for (const id of possibleIds) {

        const botPhone =
            phoneFromJid(id);

        if (
            botPhone &&
            senderPhone === botPhone
        ) {
            return true;
        }
    }


    /*
    |--------------------------------------------------------------------------
    | SESSION ID
    |--------------------------------------------------------------------------
    */

    if (sessionId) {

        const sessionString =
            String(sessionId);


        const sessionPhone =
            phoneFromJid(
                sessionString
            );

        if (
            sessionPhone &&
            senderPhone === sessionPhone
        ) {
            return true;
        }


        const sessionDigits =
            sessionString.replace(
                /[^\d]/g,
                ''
            );


        if (
            sessionDigits &&
            sessionDigits.includes(
                senderPhone
            )
        ) {
            return true;
        }
    }


    return false;
}


/*
|--------------------------------------------------------------------------
| GLOBAL BOT OWNER
|--------------------------------------------------------------------------
*/

function isBotOwner(senderJid) {

    const senderPhone =
        phoneFromJid(senderJid);

    const ownerPhone =
        String(
            config?.bot?.ownerNumber ||
            config?.ownerNumber ||
            ''
        )
        .replace(/[^\d]/g, '');

    if (
        !senderPhone ||
        !ownerPhone
    ) {
        return false;
    }

    return senderPhone === ownerPhone;
}


/*
|--------------------------------------------------------------------------
| GROUP METADATA
|--------------------------------------------------------------------------
*/

const GROUP_META_CACHE = new WeakMap();
const GROUP_META_TTL_MS = Number(process.env.GROUP_META_TTL_MS) || 20000;

function invalidateGroupMetadata(sock, groupJid) {
    try {
        const c = GROUP_META_CACHE.get(sock);
        if (!c) return;
        if (groupJid) c.delete(groupJid); else c.clear();
    } catch (_) {}
}

async function getGroupMetadata(
    sock,
    store,
    groupJid
) {

    // Cache fupi: inaepusha kuuliza WhatsApp kila ujumbe (inaharakisha bot)
    let cache = null;
    try {
        if (sock && typeof sock === 'object') {
            cache = GROUP_META_CACHE.get(sock);
            if (!cache) { cache = new Map(); GROUP_META_CACHE.set(sock, cache); }
            const hit = cache.get(groupJid);
            if (hit && Date.now() - hit.at < GROUP_META_TTL_MS) return hit.data;
        }
    } catch (_) { cache = null; }

    const result = await getGroupMetadataRaw(sock, store, groupJid);
    if (cache && result && Array.isArray(result.participants)) {
        cache.set(groupJid, { at: Date.now(), data: result });
    }
    return result;
}

async function getGroupMetadataRaw(
    sock,
    store,
    groupJid
) {

    try {

        if (
            store &&
            typeof store.fetchGroupMetadata ===
                'function'
        ) {

            const metadata =
                await store.fetchGroupMetadata(
                    groupJid,
                    sock
                );

            if (metadata) {
                return metadata;
            }
        }

    } catch (error) {

        logger?.warn?.(
            '[GROUP METADATA STORE ERROR]',
            error?.message || error
        );
    }


    try {

        if (
            sock &&
            typeof sock.groupMetadata ===
                'function'
        ) {

            return await sock.groupMetadata(
                groupJid
            );
        }

    } catch (error) {

        logger?.warn?.(
            '[GROUP METADATA ERROR]',
            error?.message || error
        );
    }


    return null;
}


/*
|--------------------------------------------------------------------------
| FIND PARTICIPANT
|--------------------------------------------------------------------------
*/

function jidKey(jid) {
    // "2557xxx:12@s.whatsapp.net" -> "2557xxx@s.whatsapp.net" (ondoa device)
    const n = normalizeJid(jid);
    if (!n) return '';
    const [user, server] = n.split('@');
    return (user.split(':')[0] + '@' + (server || '')).toLowerCase();
}

function participantIds(participant) {
    return [
        participant?.id,
        participant?.jid,
        participant?.lid,
        participant?.phoneNumber,
        participant?.phone_number
    ].filter(Boolean);
}

function findParticipant(
    participants,
    jid
) {

    // jid inaweza kuwa string moja au orodha (pn + lid)
    const targets = (Array.isArray(jid) ? jid : [jid])
        .map(jidKey)
        .filter(Boolean);

    if (!targets.length) {
        return null;
    }

    const list = participants || [];

    for (const participant of list) {
        const keys = participantIds(participant).map(jidKey);
        if (targets.some(t => keys.includes(t))) {
            return participant;
        }
    }

    // Mwisho: linganisha namba tu, lakini ukiwa @s.whatsapp.net pekee
    // (usilinganishe LID na namba ya simu)
    for (const participant of list) {
        const phones = participantIds(participant)
            .filter(id => /@s\.whatsapp\.net$/i.test(normalizeJid(id)))
            .map(phoneFromJid);
        if (targets.some(t => /@s\.whatsapp\.net$/i.test(t) && phones.includes(phoneFromJid(t)))) {
            return participant;
        }
    }

    return null;
}


/*
|--------------------------------------------------------------------------
| ADMIN CHECK
|--------------------------------------------------------------------------
*/

function participantIsAdmin(
    participant
) {

    return !!(
        participant &&
        (
            participant.admin === 'admin' ||
            participant.admin === 'superadmin'
        )
    );
}


/*
|--------------------------------------------------------------------------
| GROUP ADMIN CHECK
|--------------------------------------------------------------------------
*/

async function isGroupAdmin(
    sock,
    store,
    groupJid,
    senderJid
) {

    const metadata =
        await getGroupMetadata(
            sock,
            store,
            groupJid
        );

    if (!metadata) {
        return false;
    }

    const participant =
        findParticipant(
            metadata.participants || [],
            senderJid
        );

    return participantIsAdmin(
        participant
    );
}


/*
|--------------------------------------------------------------------------
| BOT ADMIN CHECK
|--------------------------------------------------------------------------
*/

async function isBotGroupAdmin(
    sock,
    store,
    groupJid
) {

    const metadata =
        await getGroupMetadata(
            sock,
            store,
            groupJid
        );

    if (!metadata) {
        return false;
    }


    const botIds = [
        sock?.user?.id,
        sock?.user?.jid,
        sock?.user?.lid,
        sock?.authState?.creds?.me?.id,
        sock?.authState?.creds?.me?.lid
    ].filter(Boolean);

    const participant =
        findParticipant(
            metadata.participants || [],
            botIds
        );

    return participantIsAdmin(
        participant
    );
}


/*
|--------------------------------------------------------------------------
| ACCESS DENIED
|--------------------------------------------------------------------------
*/

async function sendAccessDenied(
    sock,
    from,
    msg,
    reason
) {

    try {

        await sock.sendMessage(
            from,
            {
                text:
                    '❌ *Access Denied*\n\n' +
                    reason
            },
            {
                quoted: msg
            }
        );

    } catch (error) {

        logger?.error?.(
            '[ACCESS DENIED ERROR]',
            error?.message || error
        );
    }
}


/*
|--------------------------------------------------------------------------
| GROUP SETTINGS
|--------------------------------------------------------------------------
*/

function getGroupSettings(
    settings,
    groupId
) {

    if (!settings) {
        return null;
    }

    if (!settings.metadata) {
        settings.metadata = {};
    }

    if (!settings.metadata.groups) {
        settings.metadata.groups = {};
    }

    if (
        !settings.metadata.groups[groupId]
    ) {

        settings.metadata.groups[groupId] = {};
    }

    return settings.metadata.groups[groupId];
}


/*
|--------------------------------------------------------------------------
| ANTILINK
|--------------------------------------------------------------------------
*/

async function handleAntilink(
    sock,
    store,
    settings,
    msg,
    from,
    senderJid,
    isGroup,
    sessionId,
    userId,
    extra = {}
) {

    if (!isGroup) {
        return false;
    }

    // Aliyepair bot (mmiliki wa session) ndiye admin wa antilink:
    // links zake HAZIFUTWI kamwe.
    if (
        msg?.key?.fromMe === true ||
        extra?.senderIsOwner === true
    ) {
        return false;
    }

    {
        const sp = phoneFromJid(senderJid);
        const pp = String(extra?.pairedPhoneNumber || '').replace(/[^\d]/g, '');
        if (sp && pp && sp === pp) {
            return false;
        }
    }

    let currentSettings =
        settings;

    if (
        !currentSettings &&
        sessionId
    ) {

        try {

            currentSettings =
                await Setting.getOrCreate(
                    sessionId,
                    userId
                );

        } catch (e) {

            return false;
        }
    }


    const groupSettings =
        getGroupSettings(
            currentSettings,
            from
        );


    if (
        groupSettings?.antilink !== true
    ) {
        return false;
    }


    const text =
        extractLinkText(msg);

    if (!text) {
        return false;
    }


    const linkRegex =
        /(?:https?:\/\/|www\.|wa\.me\/|chat\.whatsapp\.com\/|youtube\.com\/|youtu\.be\/|facebook\.com\/|fb\.watch\/|instagram\.com\/|twitter\.com\/|x\.com\/|tiktok\.com\/|t\.me\/|[a-z0-9-]+\.(?:com|net|org|co|io|me|tv|xyz|info|biz|site|online|link|ly|gl|app|ke|tz)(?:\/|\b))[^\s]*/i;


    if (!linkRegex.test(text)) {
        return false;
    }


    const metadata =
        await getGroupMetadata(
            sock,
            store,
            from
        );

    if (!metadata) {
        return false;
    }


    const participant =
        findParticipant(
            metadata.participants || [],
            senderJid
        );


    /*
    |--------------------------------------------------------------------------
    | ADMINS CAN SEND LINKS
    |--------------------------------------------------------------------------
    */

    if (
        participantIsAdmin(
            participant
        )
    ) {
        return false;
    }


    /*
    |--------------------------------------------------------------------------
    | BOT MUST BE ADMIN
    |--------------------------------------------------------------------------
    */

    const botIsAdmin =
        await isBotGroupAdmin(
            sock,
            store,
            from
        );


    if (!botIsAdmin) {

        logger?.warn?.(
            `[ANTILINK] Bot is not admin in ${from}`
        );

        return false;
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE MESSAGE
    |--------------------------------------------------------------------------
    */

    try {

        await sock.sendMessage(
            from,
            {
                delete: msg.key
            }
        );

        logger?.info?.(
            `[ANTILINK] Deleted link from ${senderJid} in ${from}`
        );

    } catch (error) {

        logger?.warn?.(
            '[ANTILINK DELETE ERROR]',
            error?.message || error
        );

        return false;
    }


    /*
    |--------------------------------------------------------------------------
    | WARNING
    |--------------------------------------------------------------------------
    */

    try {

        await sock.sendMessage(
            from,
            {
                text:
                    '🚫 *LINK DETECTED*\n\n' +
                    'Links are not allowed in this group.'
            },
            {
                quoted: msg
            }
        );

    } catch (error) {}


    return true;
}


/*
|--------------------------------------------------------------------------
| MUTED USER
|--------------------------------------------------------------------------
*/

function isMutedUser(
    settings,
    senderJid,
    groupId
) {

    if (!settings) {
        return false;
    }


    const groupSettings =
        getGroupSettings(
            settings,
            groupId
        );


    const mutedUsers =
        Array.isArray(
            groupSettings?.mutedUsers
        )
            ? groupSettings.mutedUsers
            : [];


    const senderPhone =
        phoneFromJid(senderJid);


    return mutedUsers.some(
        user => {

            const mutedJid =
                normalizeJid(user);

            const mutedPhone =
                phoneFromJid(mutedJid);


            return (
                mutedJid ===
                    normalizeJid(
                        senderJid
                    )

                ||

                (
                    senderPhone &&
                    mutedPhone &&
                    senderPhone === mutedPhone
                )
            );
        }
    );
}


/*
|--------------------------------------------------------------------------
| ANTI-STATUS  (delete status posts / status mentions sent to a group)
|--------------------------------------------------------------------------
*/

const ANTISTATUS_WARNED = new Map();
let antistatusDebugCount = 0;

function isGroupStatusMessage(msg) {
    const m = msg?.message;
    if (!m || typeof m !== 'object') return false;

    const layers = [
        m,
        m.ephemeralMessage?.message,
        m.viewOnceMessage?.message,
        m.viewOnceMessageV2?.message,
        m.documentWithCaptionMessage?.message,
        m.editedMessage?.message
    ].filter(Boolean);

    for (const x of layers) {
        if (
            x.groupStatusMentionMessage ||
            x.groupStatusMentionMessageV2 ||
            x.statusMentionMessage ||
            x.groupStatusMessage ||
            x.groupStatusMessageV2
        ) {
            return true;
        }

        const t = x.protocolMessage?.type;
        if (t === 25 || t === 'STATUS_MENTION_MESSAGE') return true;

        // future-proof: any message part whose name says "status mention" / "group status"
        if (Object.keys(x).some((k) => /statusmention|groupstatus/i.test(k))) return true;
    }

    return false;
}

async function handleAntistatus(
    sock,
    store,
    settings,
    msg,
    from,
    senderJid,
    isGroup,
    opts = {}
) {

    if (!isGroup) {
        return false;
    }

    const groupSettings = getGroupSettings(settings, from);

    if (groupSettings?.antistatus !== true) {
        return false;
    }

    // Debug aid: ANTISTATUS_DEBUG=true logs the message types that arrive in groups
    // (max 30) so detection can be adjusted if WhatsApp changes the format.
    if (process.env.ANTISTATUS_DEBUG === 'true' && antistatusDebugCount < 30) {
        antistatusDebugCount++;
        try {
            require('../utils/connlog').connlog(
                'ANTISTATUS_DEBUG',
                `${from} keys=${Object.keys(msg?.message || {}).join(',')} detected=${isGroupStatusMessage(msg)}`
            );
        } catch (_) {}
    }

    if (!isGroupStatusMessage(msg)) {
        return false;
    }

    // never touch the bot's own messages or the bot owner's
    if (msg?.key?.fromMe === true || opts.senderIsOwner === true) {
        return false;
    }

    const metadata = await getGroupMetadata(sock, store, from);
    const sender = findParticipant(metadata?.participants || [], senderJid);

    if (participantIsAdmin(sender)) {
        return false;
    }

    let deleted = false;

    try {
        await sock.sendMessage(from, { delete: msg.key });
        deleted = true;
    } catch (_) {}

    try {
        if (deleted) {
            await sock.sendMessage(
                from,
                {
                    text:
                        `🚫 @${phoneFromJid(senderJid)} status posts / status mentions are not allowed in this group.`,
                    mentions: [senderJid]
                }
            );
        } else {
            // probably not admin: warn the group admins, at most once per 10 minutes
            const last = ANTISTATUS_WARNED.get(from) || 0;
            if (Date.now() - last > 10 * 60 * 1000) {
                ANTISTATUS_WARNED.set(from, Date.now());
                await sock.sendMessage(
                    from,
                    { text: '⚠️ Anti-status is ON but I could not delete the message. Please make me a *group admin*.' }
                );
            }
        }
    } catch (_) {}

    return true;
}


/*
|--------------------------------------------------------------------------
| ANTIMENTION
|--------------------------------------------------------------------------
*/

async function handleAntimention(
    sock,
    store,
    settings,
    msg,
    from,
    senderJid,
    isGroup
) {

    if (!isGroup) {
        return false;
    }


    const groupSettings =
        getGroupSettings(
            settings,
            from
        );


    if (
        groupSettings?.antimention !== true
    ) {
        return false;
    }


    // Collect mentions from EVERY message type (text, image/video captions,
    // documents, stickers...), not only plain text.
    const mentioned = (() => {
        const m = msg?.message || {};
        const inner =
            m.ephemeralMessage?.message ||
            m.viewOnceMessage?.message ||
            m.viewOnceMessageV2?.message ||
            m.documentWithCaptionMessage?.message ||
            m;
        const out = new Set();
        for (const key of Object.keys(inner)) {
            const list = inner[key]?.contextInfo?.mentionedJid;
            if (Array.isArray(list)) list.forEach(j => out.add(j));
        }
        return [...out];
    })();


    if (!mentioned.length) {
        return false;
    }


    const metadata =
        await getGroupMetadata(
            sock,
            store,
            from
        );


    if (!metadata) {
        return false;
    }


    const sender =
        findParticipant(
            metadata.participants || [],
            senderJid
        );


    if (
        participantIsAdmin(sender)
    ) {
        return false;
    }


    const mentionedAdmin =
        mentioned.some(
            jid => {

                const participant =
                    findParticipant(
                        metadata.participants || [],
                        jid
                    );

                return participantIsAdmin(
                    participant
                );
            }
        );


    if (!mentionedAdmin) {
        return false;
    }


    try {

        await sock.sendMessage(
            from,
            {
                delete: msg.key
            }
        );

    } catch (error) {}


    try {

        await sock.sendMessage(
            from,
            {
                text:
                    '🚫 *ADMIN MENTION DETECTED*\n\n' +
                    'Mentioning group admins is not allowed.'
            },
            {
                quoted: msg
            }
        );

    } catch (_) {}


    return true;
}


/*
|--------------------------------------------------------------------------
| DELETE MUTED MESSAGE
|--------------------------------------------------------------------------
*/

async function handleMutedMessage({
    sock,
    store,
    settings,
    msg,
    from,
    senderJid,
    isGroup
}) {

    if (!isGroup) {
        return false;
    }


    if (
        !isMutedUser(
            settings,
            senderJid,
            from
        )
    ) {
        return false;
    }


    const metadata =
        await getGroupMetadata(
            sock,
            store,
            from
        );


    if (!metadata) {
        return false;
    }


    const sender =
        findParticipant(
            metadata.participants || [],
            senderJid
        );


    if (
        participantIsAdmin(sender)
    ) {
        return false;
    }


    try {

        await sock.sendMessage(
            from,
            {
                delete: msg.key
            }
        );

    } catch (error) {}


    return true;
}


/*
|--------------------------------------------------------------------------
| HANDLE ONE MESSAGE
|--------------------------------------------------------------------------
*/

// AUTOREACT: last reaction time per chat (so busy groups are not spammed)
const AUTOREACT_LAST = new Map();
const AUTOREACT_DEFAULT = ['❤️', '🔥', '😂', '😍', '👍', '💯', '🙌', '😎', '💚', '👏'];

async function handleOneMessage({
    msg,
    sock,
    sessionId,
    userId,
    manager,
    io,
    store
}) {

    try {

        if (!msg || !sock) {
            return;
        }


        const from =
            normalizeJid(
                msg.key?.remoteJid
            );


        if (
            !from ||
            isStatusJid(from)
        ) {
            return;
        }


        const isGroup =
            isGroupJid(from);


        /*
        |--------------------------------------------------------------------------
        | FIND SENDER
        |--------------------------------------------------------------------------
        |
        | IMPORTANT:
        | fromMe lazima ichukuliwe kwanza.
        |
        */

        let senderJid = '';


        if (
            msg.key?.fromMe === true
        ) {

            senderJid =
                normalizeJid(
                    sock?.user?.id ||
                    sock?.user?.jid ||
                    sock?.user?.phone ||
                    ''
                );

        } else if (isGroup) {

            senderJid =
                normalizeJid(
                    msg.key?.participant ||
                    msg.key?.participantAlt ||
                    ''
                );

        } else {

            senderJid =
                normalizeJid(
                    msg.key?.participant ||
                    msg.key?.remoteJid ||
                    ''
                );
        }


        const senderPhone =
            phoneFromJid(
                senderJid
            );


        /*
        |--------------------------------------------------------------------------
        | LOAD DATABASE
        |--------------------------------------------------------------------------
        */

        let settings = null;
        let banned = false;


        try {

            const cachedSettings = getCached(SETTINGS_CACHE, String(sessionId));
            const results = await Promise.all([
                cachedSettings || Setting.getOrCreate(sessionId, userId),
                Ban && typeof Ban.isBanned === 'function'
                    ? Ban.isBanned(senderPhone)
                    : Promise.resolve(false)
            ]);


            settings = results[0];
            banned = results[1];
            if (!cachedSettings && settings) {
                setCached(SETTINGS_CACHE, String(sessionId), settings);
            }

        } catch (error) {

            logger?.warn?.(
                '[DATABASE CHECK ERROR]',
                error?.message || error
            );
        }


        /*
        |--------------------------------------------------------------------------
        | AUTOTYPING (shows "typing..." to the sender when enabled)
        |--------------------------------------------------------------------------
        */

        try {

            const typingOn =
                settings &&
                (
                    settings.autoTyping === true ||
                    settings.metadata?.autotyping === true
                );

            if (
                typingOn &&
                !msg?.key?.fromMe &&
                typeof sock?.sendPresenceUpdate === 'function' &&
                !String(from).endsWith('@newsletter')
            ) {

                sock.sendPresenceUpdate('composing', from).catch(() => {});

                const stopTyping = setTimeout(() => {
                    sock.sendPresenceUpdate('paused', from).catch(() => {});
                }, 4000);

                if (stopTyping.unref) stopTyping.unref();
            }

        } catch (_) {}


        /*
        |--------------------------------------------------------------------------
        | AUTOREACT (.autoreact on) - reacts to every normal message
        |--------------------------------------------------------------------------
        */

        try {

            /* AUTOREAD / ALWAYSONLINE / AUTORECORD / ANTIBADWORD (settings in .autoread, .alwaysonline, .autorecord, .antibadword) */
            try {
                if (await require('../utils/features').onMessage({ sock, store, msg, from, isGroup, senderJid, settings })) return;
            } catch (_) {}

            /* ANTIDELETE + ANTICHANNEL (per-group) */
            try { await require('../utils/antidelete').onMessage({ sock, msg, from, isGroup, senderJid, enabled: settings?.metadata?.antidelete === true, mode: settings?.metadata?.antideleteMode }); } catch (_) {}
            if (await require('../utils/antichannel').handle({ sock, msg, from, senderJid, isGroup, enabled: settings?.metadata?.groups?.[from]?.antichannel === true })) return;

            const md = settings?.metadata || {};

            if (
                md.autoreact === true &&
                !msg?.key?.fromMe &&
                msg?.key?.id &&
                msg.message &&
                !msg.message.protocolMessage &&
                !msg.message.reactionMessage &&
                !String(from).endsWith('@newsletter')
            ) {

                const scope = md.autoreactScope || 'all';

                if (
                    scope === 'all' ||
                    (scope === 'groups' && isGroup) ||
                    (scope === 'private' && !isGroup)
                ) {

                    const bodyText = String(extractText(msg) || '');
                    const pfx = settings?.prefix || '.';
                    const now = Date.now();

                    if (
                        !bodyText.startsWith(pfx) &&
                        now - (AUTOREACT_LAST.get(from) || 0) >= 1500 &&
                        (typeof sock.__queueSize !== 'function' || sock.__queueSize() < 20)
                    ) {

                        if (AUTOREACT_LAST.size > 5000) AUTOREACT_LAST.clear();
                        AUTOREACT_LAST.set(from, now);

                        const list =
                            Array.isArray(md.autoreactEmojis) && md.autoreactEmojis.length
                                ? md.autoreactEmojis
                                : AUTOREACT_DEFAULT;

                        const emoji = list[Math.floor(Math.random() * list.length)];

                        sock.sendMessage(from, { react: { text: emoji, key: msg.key } }).catch(() => {});
                    }
                }
            }

        } catch (_) {}


        /*
        |--------------------------------------------------------------------------
        | BAN CHECK
        |--------------------------------------------------------------------------
        */

        if (banned) {

            await sock.sendMessage(
                from,
                {
                    text:
                        '🚫 *Access Denied*\n\n' +
                        'You are banned from using this bot.'
                },
                {
                    quoted: msg
                }
            );

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | MODE
        |--------------------------------------------------------------------------
        */

        const mode =
            String(
                settings?.mode ||
                'public'
            ).toLowerCase();


        /*
        |--------------------------------------------------------------------------
        | PREFIX
        |--------------------------------------------------------------------------
        */

        const prefix =
            settings?.prefix ||
            config?.bot?.defaultPrefix ||
            '.';


        /*
        |--------------------------------------------------------------------------
        | OWNER STATUS
        |--------------------------------------------------------------------------
        */

        // Always use the phone saved when this WhatsApp session was paired.
        // Do not rely only on sock.user.id because WhatsApp can return a LID.
        let pairedPhoneNumber = getCached(SESSION_PHONE_CACHE, String(sessionId)) || '';

        if (!pairedPhoneNumber) {
            try {
                const sessionDoc = await Session.findOne(
                    { sessionId },
                    { phoneNumber: 1 }
                ).lean();
                pairedPhoneNumber = sessionDoc?.phoneNumber || '';
                if (pairedPhoneNumber) {
                    setCached(SESSION_PHONE_CACHE, String(sessionId), pairedPhoneNumber, 5 * 60 * 1000);
                }
            } catch (error) {
                logger?.warn?.('[SESSION OWNER LOOKUP ERROR]', error?.message || error);
            }
        }

        const senderIsSessionOwner =
            isSessionOwner(
                senderJid,
                sock,
                sessionId,
                pairedPhoneNumber
            );


        const senderIsBotOwner =
            isBotOwner(
                senderJid
            );


        const senderIsOwner =
            senderIsSessionOwner ||
            senderIsBotOwner;


        /*
        |--------------------------------------------------------------------------
        | TEXT
        |--------------------------------------------------------------------------
        */

        const text =
            extractText(msg);


        /*
        |--------------------------------------------------------------------------
        | NON-TEXT MESSAGE
        |--------------------------------------------------------------------------
        */

        if (!text) {

            if (isGroup) {

                if (
                    await handleMutedMessage({
                        sock,
                        store,
                        settings,
                        msg,
                        from,
                        senderJid,
                        isGroup
                    })
                ) {
                    return;
                }


                if (
                    await handleAntilink(
                        sock,
                        store,
                        settings,
                        msg,
                        from,
                        senderJid,
                        isGroup,
                        sessionId,
                        userId,
                        { senderIsOwner: senderIsSessionOwner, pairedPhoneNumber }
                    )
                ) {
                    return;
                }


                if (
                    await handleAntimention(
                        sock,
                        store,
                        settings,
                        msg,
                        from,
                        senderJid,
                        isGroup
                    )
                ) {
                    return;
                }


                if (
                    await handleAntistatus(
                        sock,
                        store,
                        settings,
                        msg,
                        from,
                        senderJid,
                        isGroup,
                        { senderIsOwner }
                    )
                ) {
                    return;
                }
            }


            return;
        }


        /*
        |--------------------------------------------------------------------------
        | PARSE COMMAND
        |--------------------------------------------------------------------------
        */

        // Typing just "id" (no prefix) also works and shows the chat / group ID.
        const parsed =
            parseCommand(
                text,
                prefix
            ) || (
                /^(id|gid|jid)$/i.test(String(text).trim())
                    ? { command: 'id', args: [], query: '' }
                    : null
            );


        /*
        |--------------------------------------------------------------------------
        | NORMAL MESSAGE
        |--------------------------------------------------------------------------
        */

        if (!parsed) {

            if (isGroup) {

                if (
                    await handleMutedMessage({
                        sock,
                        store,
                        settings,
                        msg,
                        from,
                        senderJid,
                        isGroup
                    })
                ) {
                    return;
                }


                if (
                    await handleAntilink(
                        sock,
                        store,
                        settings,
                        msg,
                        from,
                        senderJid,
                        isGroup,
                        sessionId,
                        userId,
                        { senderIsOwner: senderIsSessionOwner, pairedPhoneNumber }
                    )
                ) {
                    return;
                }


                if (
                    await handleAntimention(
                        sock,
                        store,
                        settings,
                        msg,
                        from,
                        senderJid,
                        isGroup
                    )
                ) {
                    return;
                }


                if (
                    await handleAntistatus(
                        sock,
                        store,
                        settings,
                        msg,
                        from,
                        senderJid,
                        isGroup,
                        { senderIsOwner }
                    )
                ) {
                    return;
                }
            }


            return;
        }


        const {
            command,
            args,
            query
        } = parsed;

        /* JOIN GATE: private chats must follow the channels first (.joined unlocks) */
        if (!msg.key?.fromMe && !isGroup) {
            const gate = require('../utils/joinGate');
            if (gate.enabled()) {
                if (command === 'joined') {
                    gate.markJoined(senderJid || from);
                    await sock.sendMessage(from, { text: '✅ Unlocked. Send *.menu* to see all commands.' }, { quoted: msg });
                    return;
                }
                if (!gate.isJoined(senderJid || from)) {
                    await sock.sendMessage(from, { text: gate.prompt() }, { quoted: msg });
                    return;
                }
            }
        }


        /*
        |--------------------------------------------------------------------------
        | MODE COMMAND
        |--------------------------------------------------------------------------
        |
        | .mode public
        | .mode private
        | .mode status
        |
        */

        if (
            command === 'mode'
        ) {

            /*
            | Only session owner can change mode.
            */

            if (!senderIsSessionOwner) {

                await sendAccessDenied(
                    sock,
                    from,
                    msg,
                    '👑 Only the person who paired this bot can change the mode.'
                );

                return;
            }


            const requestedMode =
                String(
                    args?.[0] || ''
                )
                .toLowerCase()
                .trim();


            /*
            |--------------------------------------------------------------------------
            | STATUS
            |--------------------------------------------------------------------------
            */

            if (
                requestedMode === 'status'
            ) {

                const currentMode =
                    String(
                        settings?.mode ||
                        'public'
                    ).toLowerCase();


                await sock.sendMessage(
                    from,
                    {
                        text:
                            '⚙️ *BOT MODE*\n\n' +

                            `Current Mode: ${
                                currentMode === 'private'
                                    ? '🔒 PRIVATE'
                                    : '🌍 PUBLIC'
                            }\n\n` +

                            '🌍 Public = Everyone can use the bot.\n' +

                            '🔒 Private = Only the person who paired this session can use the bot.'
                    },
                    {
                        quoted: msg
                    }
                );

                return;
            }


            /*
            |--------------------------------------------------------------------------
            | VALIDATE MODE
            |--------------------------------------------------------------------------
            */

            if (
                requestedMode !== 'public' &&
                requestedMode !== 'private'
            ) {

                await sock.sendMessage(
                    from,
                    {
                        text:
                            '⚙️ *BOT MODE*\n\n' +

                            `Use:\n\n` +

                            `${prefix}mode public\n` +

                            `${prefix}mode private\n` +

                            `${prefix}mode status`
                    },
                    {
                        quoted: msg
                    }
                );

                return;
            }


            /*
            |--------------------------------------------------------------------------
            | SAVE MODE
            |--------------------------------------------------------------------------
            */

            try {

                settings.mode =
                    requestedMode;

                await settings.save();

            } catch (error) {

                logger?.error?.(
                    '[MODE SAVE ERROR]',
                    error?.message || error
                );

                await sock.sendMessage(
                    from,
                    {
                        text:
                            '❌ Failed to save bot mode.'
                    },
                    {
                        quoted: msg
                    }
                );

                return;
            }


            /*
            |--------------------------------------------------------------------------
            | RESPONSE
            |--------------------------------------------------------------------------
            */

            if (
                requestedMode === 'private'
            ) {

                await sock.sendMessage(
                    from,
                    {
                        text:
                            '🔒 *PRIVATE MODE ENABLED* ✅\n\n' +

                            '👑 You can continue using this bot.\n' +

                            '🚫 Other users will be blocked.'
                    },
                    {
                        quoted: msg
                    }
                );

            } else {

                await sock.sendMessage(
                    from,
                    {
                        text:
                            '🌍 *PUBLIC MODE ENABLED* ✅\n\n' +

                            '👥 Everyone can use this bot now.'
                    },
                    {
                        quoted: msg
                    }
                );
            }


            return;
        }


        /*
        |--------------------------------------------------------------------------
        | PRIVATE MODE
        |--------------------------------------------------------------------------
        |
        | Hapa owner wa session anaendelea kutumia bot.
        |
        */

        if (
            mode === 'private' &&
            !senderIsSessionOwner
        ) {

            await sendAccessDenied(
                sock,
                from,
                msg,
                '🔒 This bot is currently in *PRIVATE MODE*.\n\n' +
                '👑 Only the person who paired this session can use it.'
            );

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | OWNER COMMANDS
        |--------------------------------------------------------------------------
        */

        if (
            OWNER_COMMANDS.has(
                command
            )
        ) {

            if (!senderIsOwner) {

                await sendAccessDenied(
                    sock,
                    from,
                    msg,
                    '👑 This command is available to the bot owner only.'
                );

                return;
            }
        }


        /*
        |--------------------------------------------------------------------------
        | GROUP ADMIN COMMANDS
        |--------------------------------------------------------------------------
        */

        let senderIsGroupAdmin =
            false;


        if (
            GROUP_ADMIN_COMMANDS.has(
                command
            )
        ) {

            if (!isGroup) {

                await sock.sendMessage(
                    from,
                    {
                        text:
                            '❌ This command can only be used in groups.'
                    },
                    {
                        quoted: msg
                    }
                );

                return;
            }


            if (!senderIsOwner) {

                senderIsGroupAdmin =
                    await isGroupAdmin(
                        sock,
                        store,
                        from,
                        senderJid
                    );


                if (
                    !senderIsGroupAdmin
                ) {

                    await sendAccessDenied(
                        sock,
                        from,
                        msg,
                        '👮 This command is only available to group admins.'
                    );

                    return;
                }
            }
        }


        /*
        |--------------------------------------------------------------------------
        | GROUP PROTECTION
        |--------------------------------------------------------------------------
        */

        if (isGroup) {

            if (
                await handleMutedMessage({
                    sock,
                    store,
                    settings,
                    msg,
                    from,
                    senderJid,
                    isGroup
                })
            ) {
                return;
            }


            if (
                await handleAntilink(
                    sock,
                    store,
                    settings,
                    msg,
                    from,
                    senderJid,
                    isGroup,
                    sessionId,
                    userId,
                        { senderIsOwner: senderIsSessionOwner, pairedPhoneNumber }
                )
            ) {
                return;
            }


            if (
                await handleAntimention(
                    sock,
                    store,
                    settings,
                    msg,
                    from,
                    senderJid,
                    isGroup
                )
            ) {
                return;
            }


            if (
                await handleAntistatus(
                    sock,
                    store,
                    settings,
                    msg,
                    from,
                    senderJid,
                    isGroup,
                    { senderIsOwner }
                )
            ) {
                return;
            }
        }


        /*
        |--------------------------------------------------------------------------
        | COMMAND CONTEXT
        |--------------------------------------------------------------------------
        */

        const ctx = {

            sessionId,
            userId,

            sock,
            manager,
            io,
            store,

            msg,
            from,

            senderJid,
            senderPhone,

            isGroup,

            text,

            command,
            args,
            query,

            prefix,

            settings,
            mode,

            isSessionOwner:
                senderIsSessionOwner,

            isBotOwner:
                senderIsBotOwner,

            isOwner:
                senderIsOwner,

            isPublicCommand:
                PUBLIC_COMMANDS.has(
                    command
                ),

            isGroupAdmin:
                senderIsGroupAdmin,

            // Expose the command registry to commands such as .menu
            // and .help. Without this, .menu gets ctx.getCommands()
            // as undefined and fails silently.
            getCommands: () => {
                try {
                    const registry = require('../phonephix/index');
                    return registry.getCommands();
                } catch (err) {
                    logger.warn(
                        `[COMMAND REGISTRY] Failed to read commands: ${err.message}`
                    );
                    return [];
                }
            }
        };


        /*
        |--------------------------------------------------------------------------
        | RUN COMMAND
        |--------------------------------------------------------------------------
        */

        logger.info(
            `[COMMAND] session=${sessionId} sender=${senderPhone} command=${command}`
        );


        const executed =
            await runCommand(ctx);


        if (!executed) {

            logger.warn(
                `[COMMAND NOT FOUND] session=${sessionId} command=${command}`
            );

            return;
        }

    } catch (error) {

        logger?.error?.(
            '[MESSAGE HANDLER ERROR]',
            error?.message || error
        );
    }
}


/*
|--------------------------------------------------------------------------
| HANDLE INCOMING MESSAGE PAYLOAD
|--------------------------------------------------------------------------
*/

async function handleIncomingMessage({
    payload,
    messages,
    sock,
    sessionId,
    userId,
    manager,
    io,
    store
}) {

    const list =
        Array.isArray(payload)

            ? payload

            : Array.isArray(
                payload?.messages
            )

                ? payload.messages

                : Array.isArray(messages)

                    ? messages

                    : Array.isArray(
                        messages?.messages
                    )

                        ? messages.messages

                        : [];


    if (!list.length) {
        return;
    }


    // V2 burst scheduler: high concurrency without creating 200 simultaneous
    // MongoDB/network operations on one Node process.
    const CONCURRENCY = Math.max(8, Math.min(24, Number(process.env.MESSAGE_CONCURRENCY) || 16));
    let cursor = 0;

    const worker = async () => {
        while (true) {
            const index = cursor++;
            if (index >= list.length) return;
            try {
                await handleOneMessage({
                    msg: list[index], sock, sessionId, userId, manager, io, store
                });
            } catch (_) {}
        }
    };

    await Promise.all(
        Array.from({ length: Math.min(CONCURRENCY, list.length) }, () => worker())
    );
}


/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

module.exports = {

    invalidateSettingsCache,

    invalidateGroupMetadata,

    extractText,

    normalizeJid,

    phoneFromJid,

    isGroupJid,

    isStatusJid,

    parseCommand,

    isSessionOwner,

    isBotOwner,

    getGroupMetadata,

    findParticipant,

    isGroupAdmin,

    isBotGroupAdmin,

    sendAccessDenied,

    getGroupSettings,

    handleAntilink,

    handleAntimention,

    handleAntistatus,

    handleMutedMessage,

    isMutedUser,

    handleOneMessage,

    handleIncomingMessage

};
