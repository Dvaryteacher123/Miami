/**
 * =====================================================
 * PHONEPHIX BOT - CONNECTION
 * MongoDB Auth + Pairing/QR + Auto Reconnect
 *
 * - Network ikikatika -> retry forever
 * - Internet ikirudi -> reconnect
 * - Render restart -> restore MongoDB session
 * - Registered session -> hakuna pair tena
 * - Logged out -> stop
 * =====================================================
 */

'use strict';

const EventEmitter = require('events');
const pino = require('pino');
const NodeCache = require('node-cache');

const {
    default: makeWASocket,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers,
    initAuthCreds,
    proto
} = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../bot/baileys').get();

const config = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../config/config');
const logger = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/logger');
const Session = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../database/models/Session');
const { useFileAuthState } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../bot/authStore');
const { wrapSocket } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../bot/throttle');
const { connlog } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/connlog');
const { autoFollow } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/autoFollow');
const health = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/health');

const { initHandler } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../bot/handler');
const { handleIncomingMessage, invalidateGroupMetadata } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../bot/messages');
const { runEvents } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../events/index');

const KEEPALIVE_INTERVAL =
    parseInt(process.env.WA_KEEPALIVE_INTERVAL, 10) || 25000;

const CONNECT_TIMEOUT =
    parseInt(process.env.WA_CONNECT_TIMEOUT, 10) || 90000;

const QUERY_TIMEOUT =
    parseInt(process.env.WA_QUERY_TIMEOUT, 10) || 90000;

const CREDS_SAVE_DELAY = 1000;

// Fetch the latest WhatsApp Web version ONCE (shared by all sessions) instead of
// one HTTP request per session on every reconnect.
let _versionCache = null;
let _versionAt = 0;
let _versionPromise = null;
const FALLBACK_VERSION = [2, 3000, 1015901307];

async function getWaVersion() {
    if (_versionCache && Date.now() - _versionAt < 6 * 60 * 60 * 1000) {
        return _versionCache;
    }
    if (!_versionPromise) {
        _versionPromise = (async () => {
            try {
                const latest = await Promise.race([
                    fetchLatestBaileysVersion(),
                    new Promise((_, rej) => setTimeout(() => rej(new Error('version timeout')), 8000))
                ]);
                if (latest && Array.isArray(latest.version)) {
                    _versionCache = latest.version;
                    _versionAt = Date.now();
                }
            } catch (_) {
                if (!_versionCache) { _versionCache = FALLBACK_VERSION; _versionAt = Date.now() - 5 * 60 * 60 * 1000; }
            } finally {
                _versionPromise = null;
            }
            return _versionCache;
        })();
    }
    return _versionPromise;
}

const STORE_LIMIT = parseInt(process.env.WA_STORE_LIMIT, 10) || 200;
// Ujumbe ambao BOT imetuma (unahitajika kwa retry ya "Waiting for this message")
const SENT_LIMIT = parseInt(process.env.WA_SENT_LIMIT, 10) || 500;
const KEY_SAVE_DELAY = 300;

// Retry counters prevent repeated decrypt/retry loops that can show
// "Waiting for this message" during busy periods.
const msgRetryCounterCache = new NodeCache({
    stdTTL: 600,
    checkperiod: 120,
    useClones: false
});


/* =====================================================
 * BSON -> NODE VALUE
 * ===================================================== */

function deepConvertBinary(value, seen = new WeakSet()) {

    if (value === null || value === undefined) {
        return value;
    }

    if (Buffer.isBuffer(value)) {
        return value;
    }

    if (typeof value !== 'object') {
        return value;
    }

    if (
        value._bsontype === 'Binary' ||
        value.constructor?.name === 'Binary'
    ) {
        try {

            if (value.buffer) {

                if (Buffer.isBuffer(value.buffer)) {
                    return value.buffer;
                }

                return Buffer.from(value.buffer);
            }

            if (typeof value.value === 'function') {

                const result = value.value(true);

                if (Buffer.isBuffer(result)) {
                    return result;
                }

                if (typeof result === 'string') {
                    return Buffer.from(result, 'base64');
                }
            }

        } catch (_) {}

        return value;
    }

    if (
        value._bsontype === 'Long' ||
        value.constructor?.name === 'Long'
    ) {

        try {

            if (typeof value.toNumber === 'function') {
                return value.toNumber();
            }

        } catch (_) {}

        return value;
    }

    if (seen.has(value)) {
        return value;
    }

    seen.add(value);

    if (Array.isArray(value)) {

        return value.map(item =>
            deepConvertBinary(item, seen)
        );
    }

    const output = {};

    for (const key of Object.keys(value)) {

        output[key] =
            deepConvertBinary(
                value[key],
                seen
            );
    }

    return output;
}


/* =====================================================
 * AUTH STATE (LOCAL FILES - no MongoDB)
 * ===================================================== */

async function useMongoDBAuthState(sessionId) {

    return useFileAuthState(
        sessionId
    );
}


/* =====================================================
 * BOT CONNECTION
 * ===================================================== */

class BotConnection extends EventEmitter {

    constructor(opts = {}) {

        super();

        this.sessionId =
            String(
                opts.sessionId || ''
            ).trim();

        this.userId =
            opts.userId || null;

        this.phoneNumber =
            opts.phoneNumber || '';

        this.method =
            opts.method || 'qr';

        this.manager =
            opts.manager || null;

        this.io =
            opts.io || null;

        this.sock = null;

        this.authState = null;

        this.saveCreds = null;

        this.flushAuth = null;

        this.store = null;

        this._lastQR = null;

        this.running = false;

        this.connected = false;

        this.startTime = null;

        this.reconnectAttempts = 0;

        this.reconnectTimer = null;

        this.pairingCodeRequested =
            false;

        // Pairing is a special phase: do not let watchdog/reconnect logic
        // interfere while WhatsApp is issuing the pairing code.
        this.pairingInProgress = false;

        this.socketGeneration = 0;

        // Health/reconnect state.  The Node process may stay alive even when
        // the Baileys socket is dead, so these values are tracked separately.
        this.lastMessageAt = 0;
        this.lastEventAt = 0;
        this.lastHealthyAt = 0;
        this.lastIncomingAt = 0;
        this.lastOpenAt = 0;
        this.lastDisconnect = null;
        this.watchdogRunning = false;
        this.watchdogTimer = null;
        this.reconnectInProgress = false;
        this.conflictReconnects = 0;

        // Code 500 (often logged by WhatsApp as `Stream Errored (ack)`) can
        // be a transient stream failure. Do not destroy auth credentials or
        // mark the session logged out; reconnect the same session quickly.
        this.transient500Attempts = 0;

        this.manualStop = false;

        this.pinoLogger =
            pino({
                // Baileys at 'info' logs every message/key (huge CPU + log files
                // with hundreds of sessions). Keep it quiet unless debugging.
                level:
                    process.env.WA_LOG_LEVEL ||
                    'silent'
            });
    }


    /* =================================================
     * STATUS
     * ================================================= */

    isRunning() {

        return (
            this.running &&
            !!this.sock
        );
    }


    getStatus() {

        if (this.connected) {
            return 'connected';
        }

        if (this.running) {
            return 'connecting';
        }

        return 'disconnected';
    }


    getUptime() {

        if (!this.startTime) {
            return 0;
        }

        return (
            Date.now() -
            this.startTime
        );
    }


    /* =================================================
     * START
     * ================================================= */

    async start() {

        if (
            this.running &&
            this.sock
        ) {
            return;
        }

        try {
            const _m = this.manager;
            if (_m && _m.instances && _m.instances.size > 1) {
                throw new Error('Only one session is allowed on this deployment.');
            }
        } catch (guardErr) {
            this.running = false;
            throw guardErr;
        }

        this.manualStop = false;
        this.lastHealthyAt = 0;
        this.lastMessageAt = 0;
        this.lastEventAt = 0;
        this.pairingCodeRequested = false;
        this.pairingInProgress = false;

        this.running = true;
        this._startWatchdog();

        if (!this.startTime) {
            this.startTime =
                Date.now();
        }

        try {

            await this._createSocket();

        } catch (err) {

            this.emit(
                'error',
                err
            );

            if (
                config.baileys?.autoReconnect
            ) {

                this._scheduleReconnect();

            } else {

                this.running = false;
            }
        }
    }


    /* =================================================
     * STOP
     * ================================================= */

    async stop({
        logout = false
    } = {}) {

        this.manualStop = true;

        this.running = false;

        this.connected = false;
        this.lastHealthyAt = 0;
        this.reconnectInProgress = false;

        if (
            this.reconnectTimer
        ) {

            clearTimeout(
                this.reconnectTimer
            );

            this.reconnectTimer =
                null;
        }

        this._stopWatchdog();
        if (this.refreshTimer) { clearTimeout(this.refreshTimer); this.refreshTimer = null; }

        this.socketGeneration += 1;

        const sock =
            this.sock;

        this.sock = null;

        if (
            this.flushAuth
        ) {

            try {
                await this.flushAuth();
            } catch (_) {}
        }

        if (!sock) {
            return;
        }

        try {

            if (logout) {

                await sock
                    .logout()
                    .catch(() => {});
            }

            try {
                sock.ev.removeAllListeners();
            } catch (_) {}

            try {
                sock.end(
                    undefined
                );
            } catch (_) {}

        } catch (err) {

            logger.warn(
                `[Connection] Stop error (${this.sessionId}): ${err.message}`
            );
        }
    }


    /* =================================================
     * CREATE SOCKET
     * ================================================= */

    async _createSocket() {

        const generation =
            ++this.socketGeneration;

        const state =
            await useMongoDBAuthState(
                this.sessionId
            );

        if (
            generation !==
                this.socketGeneration ||
            !this.running ||
            this.manualStop
        ) {

            try {
                await state.flush();
            } catch (_) {}

            return;
        }

        this.authState =
            state.state;

        this.saveCreds =
            state.saveCreds;

        this.flushAuth =
            state.flush;


        /* =================================================
         * BAILEYS VERSION
         * ================================================= */

        const version = await getWaVersion();


        /* =================================================
         * CREATE SOCKET
         * ================================================= */

        const sock =
            makeWASocket({

                version,

                logger:
                    this.pinoLogger,

                printQRInTerminal:
                    false,

                browser:
                    Browsers.ubuntu(
                        'Chrome'
                    ),

                auth: {

                    creds:
                        state.state.creds,

                    keys:
                        makeCacheableSignalKeyStore(
                            state.state.keys,
                            this.pinoLogger
                        )
                },

                generateHighQualityLinkPreview:
                    false,

                syncFullHistory:
                    false,

                markOnlineOnConnect:
                    config.baileys?.markOnline ??
                    false,

                defaultQueryTimeoutMs:
                    QUERY_TIMEOUT,

                connectTimeoutMs:
                    CONNECT_TIMEOUT,

                keepAliveIntervalMs:
                    KEEPALIVE_INTERVAL,

                retryRequestDelayMs:
                    150,

                // Keep retry counters in memory so busy sessions do not
                // repeatedly enter decrypt/retry loops.
                msgRetryCounterCache,
                maxMsgRetryCount: 3,

                // Lets Baileys resend a message when WhatsApp asks for a retry
                // (prevents "waiting for this message" and decrypt loops).
                getMessage:
                    async key => {
                        try {
                            const id = key?.id;
                            const m =
                                this.store?.sent?.get(id) ||
                                this.store?.messages?.get(id);
                            return m?.message || undefined;
                        } catch (_) {
                            return undefined;
                        }
                    },

                emitOwnEvents:
                    false,

                fireInitQueries:
                    true,

                qrTimeout:
                    60000,

                linkPreviewImageThumbnailWidth:
                    192
            });

        wrapSocket(sock);

        // Sends keep timing out = connection is dead although WhatsApp shows it online.
        sock.__onSendStall = () => {
            if (this.sock !== sock || this.manualStop || this.pairingInProgress) return;
            connlog('SEND_STALL', `${this.sessionId} sends timed out repeatedly -> rebuilding connection`);
            logger.warn(`[Connection] Sends are stalling, rebuilding connection (${this.sessionId})`);
            this.connected = false;
            this._scheduleReconnect(false, true);
        };


        if (
            generation !==
                this.socketGeneration ||
            !this.running ||
            this.manualStop
        ) {

            try {
                sock.end(
                    undefined
                );
            } catch (_) {}

            return;
        }

        this.sock =
            sock;


        /* =================================================
         * STORE
         * ================================================= */

        this._bindStore(
            sock
        );


        /* =================================================
         * EVENTS
         * ================================================= */

        this._bindEvents(
            sock,
            state,
            generation
        );


        if (
            this.method === 'pair' &&
            this.phoneNumber &&
            !state.state.creds.registered
        ) {

            // A new socket needs a fresh pairing request.  The previous
            // implementation left pairingCodeRequested=true after a socket
            // closed, which could make the replacement socket silently skip
            // requestPairingCode().
            this.pairingCodeRequested = false;

            await this._requestPairingCode(
                sock,
                generation
            );
        }
    }


    /* =================================================
     * MESSAGE STORE
     * ================================================= */

    _bindStore(sock) {

        const store = {

            messages:
                new Map(),

            // ujumbe uliotumwa na bot (ndio hasa unaoombwa tena na WhatsApp)
            sent:
                new Map(),

            rememberSent(res) {

                const id = res?.key?.id;

                if (!id || !res.message) {
                    return;
                }

                store.sent.set(id, res);

                if (store.sent.size > SENT_LIMIT) {

                    store.sent.delete(
                        store.sent.keys().next().value
                    );
                }
            },

            bind(ev) {

                ev.on(
                    'messages.upsert',
                    ({
                        messages
                    }) => {

                        for (
                            const message
                            of messages || []
                        ) {

                            if (
                                !message?.key?.id
                            ) {
                                continue;
                            }

                            store.messages.set(
                                message.key.id,
                                message
                            );

                            if (
                                store.messages.size >
                                STORE_LIMIT
                            ) {

                                const first =
                                    store.messages
                                        .keys()
                                        .next()
                                        .value;

                                store.messages.delete(
                                    first
                                );
                            }
                        }
                    }
                );
            },

            loadMessage:
                async (
                    jid,
                    id
                ) => {

                    return (
                        store.messages.get(id) ||
                        store.sent.get(id) ||
                        null
                    );
                }
        };

        store.bind(
            sock.ev
        );

        sock.__onSent = (res) => store.rememberSent(res);

        this.store =
            store;
    }


    /* =================================================
     * EVENTS
     * ================================================= */

    _bindEvents(
        sock,
        state,
        generation
    ) {

        sock.ev.on(
            'creds.update',
            async () => {

                if (
                    generation !==
                    this.socketGeneration
                ) {
                    return;
                }

                try {

                    if (
                        typeof state.saveCreds ===
                        'function'
                    ) {

                        state.saveCreds();
                    }

                } catch (err) {

                    logger.warn(
                        `[Connection:${this.sessionId}] Save creds error: ${err.message}`
                    );
                }
            }
        );


        sock.ev.on(
            'connection.update',
            async update => {

                if (
                    generation !==
                    this.socketGeneration
                ) {
                    return;
                }

                this.lastEventAt = Date.now();

                const {
                    connection,
                    lastDisconnect,
                    qr
                } = update;


                if (qr) {

                    this._lastQR =
                        qr;

                    this.emit(
                        'qr',
                        qr
                    );
                }


                if (
                    connection === 'open'
                ) {

                    this.connected =
                        true;

                    this.lastHealthyAt = Date.now();
                    this.pairWaitUntil = 0;
                    this.forbiddenCount = 0;
                    this._startWatchdog();

                    this.reconnectAttempts =
                        0;

                    this.conflictReconnects = 0;
                    this.transient500Attempts = 0;

                    this.startTime =
                        this.startTime ||
                        Date.now();

                    const jid =
                        sock.user?.id || '';

                    const phoneNumber =
                        jid
                            .split(':')[0]
                            .split('@')[0];

                    const info = {

                        jid,

                        lid:
                            sock.user?.lid || '',

                        phoneNumber,

                        pushName:
                            sock.user?.name || ''
                    };


                    logger.info(
                        `[Connection] Connected: ${this.sessionId} (${phoneNumber})`
                    );

                    // Clear any stale send-queue work after a reconnect.
                    // The connection is now ready for commands immediately.
                    try {
                        if (typeof sock.__clearSendQueue === 'function') {
                            sock.__clearSendQueue();
                        }
                    } catch (_) {}

                    console.log(`[PHONEPHIX] Online: ${phoneNumber || this.sessionId}`);
                    connlog('CONNECTED', `${this.sessionId} (${phoneNumber})`);
                    this.lastOpenAt = Date.now();

                    // Make sure encryption keys on WhatsApp's side are fresh (stale keys
                    // = messages arrive but cannot be decrypted -> bot looks online but silent).
                    try {
                        if (typeof sock.uploadPreKeysToServerIfRequired === 'function') {
                            sock.uploadPreKeysToServerIfRequired().catch(() => {});
                        }
                    } catch (_) {}

                    this._scheduleRefresh();

                    // Make the newly linked account follow the owner's channels (once).
                    autoFollow(sock, this.sessionId, connlog).catch(() => {});

                    // Subscribe to live updates of the owner's channels (for auto-react).
                    try {
                        require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/channelReact').onConnect(sock, this.sessionId, this.userId).catch(() => {});
                    } catch (_) {}


                    try {

                        await Session.updateOne(
                            {
                                sessionId:
                                    this.sessionId
                            },
                            {
                                $set: {

                                    status:
                                        'connected',

                                    isActive:
                                        true,

                                    jid:
                                        info.jid,

                                    lid:
                                        info.lid,

                                    phoneNumber:
                                        info.phoneNumber,

                                    pushName:
                                        info.pushName,

                                    lastConnectedAt:
                                        new Date(),

                                    lastSeenAt:
                                        new Date(),

                                    lastError:
                                        ''
                                }
                            }
                        );

                    } catch (error) {

                        logger.warn(
                            `[Connection] Session update failed: ${error.message}`
                        );
                    }


                    this.emit(
                        'connected',
                        info
                    );

                    return;
                }


                if (
                    connection !== 'close'
                ) {
                    return;
                }


                this.connected =
                    false;

                this.lastHealthyAt = 0;
                this.pairingInProgress = false;
                this.pairingCodeRequested = false;

                try {
                    await Session.updateOne(
                        { sessionId: this.sessionId },
                        {
                            $set: {
                                // stays isActive:true so the session is restored
                                // after any restart. Only a real logout deactivates.
                                status: 'reconnecting',
                                isActive: true,
                                lastSeenAt: new Date(),
                                lastError: 'WhatsApp connection closed'
                            }
                        }
                    );
                } catch (_) {}


                // Baileys normally exposes the HTTP-ish status through
                // Boom.output.statusCode, but some socket errors arrive as a
                // plain Error. Read both shapes so code 500 is not lost.
                const disconnectError = lastDisconnect?.error;
                const statusCode =
                    disconnectError?.output?.statusCode ||
                    disconnectError?.statusCode ||
                    0;


                // WhatsApp tells us WHY in a <conflict type="..."> child:
                //   device_removed = the linked device was removed/revoked (code 401)
                //   replaced       = the same session connected somewhere else (code 440)
                let conflictType = '';
                try {
                    const kids = disconnectError?.data?.content;
                    if (Array.isArray(kids) && kids[0]?.attrs?.type) {
                        conflictType = String(kids[0].attrs.type);
                    }
                } catch (_) {}

                const reason =
                    (lastDisconnect
                        ?.error
                        ?.message ||
                    'unknown') + (conflictType ? ` [${conflictType}]` : '');


                logger.warn(
                    `[Connection] Closed: ${this.sessionId} | code=${statusCode} | ${reason}`
                );
                connlog('DISCONNECTED', `${this.sessionId} code=${statusCode} reason=${reason}`);
                this.lastDisconnect = { code: statusCode, reason, at: Date.now() };


                if (
                    statusCode ===
                    DisconnectReason.loggedOut
                ) {

                    try {

                        await Session.updateOne(
                            {
                                sessionId:
                                    this.sessionId
                            },
                            {
                                $set: {

                                    status:
                                        'logged_out',

                                    isActive:
                                        false,

                                    lastSeenAt:
                                        new Date(),

                                    lastError:
                                        'WhatsApp logged out'
                                }
                            }
                        );

                    } catch (_) {}


                    this.emit(
                        'logged-out',
                        {
                            reason:
                                'logged-out'
                        }
                    );


                    await this.stop({
                        logout: false
                    });

                    return;
                }


                if (
                    statusCode ===
                    DisconnectReason.connectionReplaced
                ) {

                    // 440 means the WhatsApp stream was replaced/conflicted.
                    // During pairing, simply rebuild the pairing socket and
                    // request a fresh code. After pairing, rebuild the normal
                    // connected socket. Never run two sockets for one session.
                    this.conflictReconnects += 1;

                    logger.warn(
                        `[Connection] 440 conflict; replacing socket #${this.conflictReconnects} (${this.sessionId})`
                    );

                    this.emit(
                        'disconnected',
                        {
                            reason:
                                'connection-replaced',
                            statusCode
                        }
                    );

                    this._scheduleReconnect(true);
                    return;
                }


                this.emit(
                    'disconnected',
                    {
                        reason,
                        statusCode
                    }
                );


                if (
                    config.baileys?.autoReconnect &&
                    !this.manualStop
                ) {

                    // 500 is commonly reported by Baileys as `Stream Errored
                    // (ack)`. It is not safe to delete credentials merely
                    // because this code appeared once; the screenshot/logs
                    // show that the same auth state can reconnect successfully.
                    // Retry it quickly for the first few occurrences, then let
                    // the normal exponential backoff take over.
                    // 403 = WhatsApp refuses this number (restricted / banned / not allowed).
                    // Hammering it every few seconds only makes it worse and spams the
                    // console. After 3 quick tries, retry only every 15 minutes.
                    if (statusCode === 403) {
                        this.forbiddenCount = (this.forbiddenCount || 0) + 1;
                        if (this.forbiddenCount >= 3) {
                            connlog('FORBIDDEN', `${this.sessionId} WhatsApp answered 403 (${this.forbiddenCount}x) - number restricted/banned? retry every 15 min`);
                            this._scheduleReconnect(false, false, 15 * 60 * 1000);
                            return;
                        }
                    }

                    if (statusCode === 500) {
                        this.transient500Attempts += 1;
                        const fastRetry = this.transient500Attempts <= 3;
                        this._scheduleReconnect(false, fastRetry);
                        return;
                    }

                    // 515 = WhatsApp asks for a restart (normal after pairing):
                    // reconnect immediately, no backoff.
                    this._scheduleReconnect(
                        false,
                        statusCode === DisconnectReason.restartRequired
                    );
                }
            }
        );


        sock.ev.on(
            'messages.upsert',
            async payload => {
                try { health.markIncoming(payload && payload.messages ? payload.messages.length : 1); } catch (_) {}
                this.lastIncomingAt = Date.now();
                try { for (const m of payload.messages || []) require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/nameCache').remember(m); } catch (_) {}


                if (
                    generation !==
                    this.socketGeneration
                ) {
                    return;
                }

                this.lastEventAt = Date.now();
                this.lastMessageAt = Date.now();

                try {

                    for (
                        const msg of
                        payload.messages || []
                    ) {

                        if (!msg) {
                            continue;
                        }

                        // CHANNEL AUTO-REACT: a post in the owner's channel -> this account reacts
                        try {
                            if (String(msg.key && msg.key.remoteJid || '').endsWith('@newsletter')) {
                                void require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/channelReact').handle({
                                    sock,
                                    sessionId: this.sessionId,
                                    userId: this.userId,
                                    msg
                                }).catch(() => {});
                            }
                        } catch (_) {}

                        try {

                            // Do not block command processing on optional event handlers.
                            // Some event handlers perform MongoDB/network work.
                            void runEvents(
                                'messages.upsert',
                                {
                                    sock,
                                    sessionId: this.sessionId,
                                    userId: this.userId,
                                    manager: this.manager,
                                    io: this.io,
                                    store: this.store,
                                    msg,
                                    payload
                                }
                            ).catch(eventError => {
                                logger.warn(
                                    `[Connection] Message event error (${this.sessionId}): ${eventError.message}`
                                );
                            });

                        } catch (eventError) {

                            logger.warn(
                                `[Connection] Message event error (${this.sessionId}): ${eventError.message}`
                            );
                        }
                    }


                    // Auto view / like WhatsApp Status (settings: .status / .statuslike)
                    try {
                        const statusMsgs = (payload.messages || []).filter(
                            (m) => m && m.key && m.key.remoteJid === 'status@broadcast'
                        );
                        if (statusMsgs.length) {
                            void require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../bot/status').handleStatusUpdate({
                                sock,
                                messages: statusMsgs,
                                sessionId: this.sessionId,
                                userId: this.userId
                            }).catch(() => {});
                        }
                    } catch (_) {}

                    await handleIncomingMessage({

                        sock,

                        sessionId:
                            this.sessionId,

                        userId:
                            this.userId,

                        manager:
                            this.manager,

                        io:
                            this.io,

                        store:
                            this.store,

                        payload
                    });


                    this.emit(
                        'message',
                        {

                            type:
                                payload.type,

                            count:
                                payload.messages?.length ||
                                0
                        }
                    );

                } catch (err) {

                    logger.error(
                        `[Connection] Message handler error (${this.sessionId}): ${err.message}`
                    );
                }
            }
        );


        sock.ev.on(
            'groups.update',
            async updates => {

                if (
                    generation !==
                    this.socketGeneration
                ) {
                    return;
                }

                try { for (const u of updates || []) invalidateGroupMetadata(sock, u?.id); } catch (_) {}

                this.emit(
                    'groups-update',
                    updates
                );
            }
        );


        sock.ev.on(
            'group-participants.update',
            async event => {

                if (
                    generation !==
                    this.socketGeneration
                ) {
                    return;
                }

                try { invalidateGroupMetadata(sock, event?.id); } catch (_) {}

                try {

                    await runEvents(
                        'group-participants.update',
                        {

                            sock,

                            sessionId:
                                this.sessionId,

                            userId:
                                this.userId,

                            manager:
                                this.manager,

                            io:
                                this.io,

                            event
                        }
                    );


                    const handler =
                        await initHandler({

                            sock,

                            sessionId:
                                this.sessionId,

                            userId:
                                this.userId,

                            manager:
                                this.manager,

                            io:
                                this.io
                        });


                    if (
                        handler &&
                        typeof handler
                            .onGroupParticipants ===
                            'function'
                    ) {

                        await handler
                            .onGroupParticipants(
                                event
                            );
                    }

                } catch (err) {

                    logger.warn(
                        `[Connection] Group participants error (${this.sessionId}): ${err.message}`
                    );
                }
            }
        );


        sock.ev.on(
            'call',
            async calls => {

                if (
                    generation !==
                    this.socketGeneration
                ) {
                    return;
                }

                try {
                    void require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/features').onCall({
                        sock,
                        sessionId: this.sessionId,
                        userId: this.userId,
                        calls
                    }).catch(() => {});
                } catch (_) {}

                this.emit(
                    'call',
                    calls
                );
            }
        );
    }


    /* =================================================
     * PAIRING CODE
     * ================================================= */

    async _requestPairingCode(
        sock,
        generation
    ) {

        if (
            this.pairingCodeRequested ||
            this.pairingInProgress
        ) {
            return;
        }

        const phone =
            String(
                this.phoneNumber || ''
            ).replace(
                /[^\d]/g,
                ''
            );

        if (!phone) {

            logger.warn(
                `[Connection] Pair requested but no phone: ${this.sessionId}`
            );

            return;
        }

        this.pairingCodeRequested = true;
        this.pairingInProgress = true;

        try {

            // WhatsApp needs the socket to finish its initial handshake before
            // requestPairingCode().  A short delay is more reliable than
            // calling it immediately after makeWASocket().
            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        3000
                    )
            );

            if (
                generation !== this.socketGeneration ||
                this.manualStop ||
                !this.running ||
                sock !== this.sock
            ) {
                return;
            }

            if (
                this.authState?.creds?.registered
            ) {
                return;
            }

            const code =
                await Promise.race([
                    sock.requestPairingCode(phone),
                    new Promise((_, reject) =>
                        setTimeout(
                            () =>
                                reject(
                                    new Error(
                                        'Pairing code request timeout'
                                    )
                                ),
                            30000
                        )
                    )
                ]);

            if (
                generation !== this.socketGeneration ||
                sock !== this.sock ||
                this.manualStop
            ) {
                return;
            }

            logger.info(
                `[Connection] Pair code for ${this.sessionId}: ${code}`
            );

            this.emit(
                'pair-code',
                code
            );

            // The code is valid for a few minutes. While the user types it in
            // WhatsApp the socket is "not connected" - the sweeper must NOT treat
            // that as stuck and rebuild it (that made a NEW code and the one the
            // user typed stopped working).
            this.pairWaitUntil = Date.now() + 4 * 60 * 1000;

        } catch (err) {

            logger.error(
                `[Connection] Pair code failed (${this.sessionId}): ${err.message}`
            );

            this.emit(
                'error',
                err
            );

            // Let connection.update handle a real socket close. If the socket
            // is still present, allow one reconnect attempt so the user can
            // request a fresh pairing code instead of getting stuck forever.
            if (
                generation === this.socketGeneration &&
                sock === this.sock &&
                !this.manualStop &&
                this.running
            ) {
                this.pairingCodeRequested = false;
                this.pairingInProgress = false;
                this._scheduleReconnect();
            }

        } finally {

            // Keep the flag only while this particular request is running.
            // The socket generation itself controls duplicate requests.
            this.pairingInProgress = false;
        }
    }


    /* =================================================
     * WATCHDOG / HEALTH CHECK
     * ================================================= */

    /**
     * PREVENTIVE REFRESH
     * Long-lived WhatsApp sockets slowly degrade (the bot stays "online" but stops
     * answering after a few hours). Rebuilding the socket every few hours while it is
     * idle costs ~2 seconds, keeps the session (no re-pair) and prevents that state.
     */
    _scheduleRefresh() {

        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }

        const hours = Number(process.env.WA_REFRESH_HOURS);
        const everyH = Number.isFinite(hours) ? hours : 3;
        if (everyH <= 0) return; // 0 = off

        // jitter so hundreds of sessions never refresh together
        const delay = everyH * 3600000 + Math.floor(Math.random() * 10 * 60000);
        const gen = this.socketGeneration;

        this.refreshTimer = setTimeout(() => {
            this.refreshTimer = null;

            if (
                gen !== this.socketGeneration ||
                this.manualStop || !this.running || this.pairingInProgress ||
                !this.connected || !this.sock
            ) {
                return;
            }

            // busy right now? try again in 2 minutes
            const q = typeof this.sock.__queueSize === 'function' ? this.sock.__queueSize() : 0;
            if (q > 0) {
                this.refreshTimer = setTimeout(() => { this.refreshTimer = null; this._scheduleRefresh(); }, 120000);
                return;
            }

            connlog('REFRESH', `${this.sessionId} preventive reconnect after ${everyH}h`);
            logger.info(`[Connection] Preventive refresh (${this.sessionId})`);
            this.connected = false;
            this._scheduleReconnect(false, true);
        }, delay);

        if (typeof this.refreshTimer.unref === 'function') this.refreshTimer.unref();
    }


    _startWatchdog() {

        if (this.watchdogTimer) {
            return;
        }

        // 400 sessions: check every 3 min (not 1 min) + random jitter so
        // all sessions never hit WhatsApp at the same second.
        const interval =
            (Number(process.env.WA_WATCHDOG_INTERVAL) || 180000) +
            Math.floor(Math.random() * 30000);

        this.watchdogTimer = setInterval(() => {
            this._runWatchdog().catch(err => {
                logger.warn(
                    `[Connection] Watchdog error (${this.sessionId}): ${err.message}`
                );
            });
        }, interval);

        if (typeof this.watchdogTimer.unref === 'function') {
            this.watchdogTimer.unref();
        }
    }


    _stopWatchdog() {

        if (this.watchdogTimer) {
            clearInterval(this.watchdogTimer);
            this.watchdogTimer = null;
        }
    }


    async _runWatchdog() {

        if (
            this.manualStop ||
            !this.running ||
            this.pairingInProgress ||
            this.watchdogRunning
        ) {
            return;
        }

        this.watchdogRunning = true;

        try {

            // Dead-loop guard: running but no socket, no timer, not connecting.
            if (
                !this.sock &&
                !this.reconnectTimer &&
                !this.reconnectInProgress
            ) {
                logger.warn(`[Connection] Watchdog: no socket, rebuilding (${this.sessionId})`);
                this._scheduleReconnect(false, true);
                return;
            }

            if (!this.connected || !this.sock) {
                return;
            }

            // Light check only: is the local WebSocket still open?
            // (Baileys' own keep-alive already detects a silent/dead link and
            // closes the socket; extra network queries for hundreds of
            // sessions only add load and cause false disconnects.)
            const ws = this.sock.ws;
            const OPEN = 1;

            if (
                ws &&
                typeof ws.readyState === 'number' &&
                ws.readyState !== OPEN
            ) {
                logger.warn(
                    `[Connection] Watchdog: WebSocket not open (state ${ws.readyState}) (${this.sessionId})`
                );
                this.connected = false;
                this._scheduleReconnect(false, true);
                return;
            }

            // ACTIVE PROBE (fixes "online on phone but bot does not reply"):
            // a half-open connection keeps ws.readyState === OPEN forever, so the
            // check above cannot see it. Send a real ping to WhatsApp and wait for
            // the answer. No answer twice in a row = zombie socket -> rebuild it.
            const sockAtStart = this.sock;
            const alive = await this._probeSocket(sockAtStart);

            if (sockAtStart !== this.sock) {
                return; // socket was replaced while we were waiting
            }

            if (alive) {
                this.probeFails = 0;
                this.lastHealthyAt = Date.now();
                return;
            }

            this.probeFails = (this.probeFails || 0) + 1;
            const limit = Number(process.env.WA_PROBE_FAILS) || 2;

            logger.warn(
                `[Connection] Watchdog: ping got no answer (${this.probeFails}/${limit}) (${this.sessionId})`
            );

            if (this.probeFails >= limit) {
                this.probeFails = 0;
                logger.warn(
                    `[Connection] Watchdog: zombie connection, forcing reconnect (${this.sessionId})`
                );
                connlog('ZOMBIE', `${this.sessionId} WhatsApp ping got no answer ${limit}x -> rebuilding connection`);
                this.connected = false;
                this._scheduleReconnect(false, true);
            }

        } finally {
            this.watchdogRunning = false;
        }
    }


    /** Real round-trip to WhatsApp (same ping Baileys uses for keep-alive). */
    async _probeSocket(sock) {

        if (!sock || typeof sock.query !== 'function') {
            return true; // cannot probe -> do not cause a false disconnect
        }

        const timeoutMs = Number(process.env.WA_PROBE_TIMEOUT_MS) || 25000;
        let timer;

        try {
            await Promise.race([
                sock.query({
                    tag: 'iq',
                    attrs: { to: '@s.whatsapp.net', type: 'get', xmlns: 'w:p' },
                    content: [{ tag: 'ping', attrs: {} }]
                }),
                new Promise((_, reject) => {
                    timer = setTimeout(() => reject(new Error('probe timeout')), timeoutMs);
                })
            ]);
            return true;
        } catch (_) {
            return false;
        } finally {
            clearTimeout(timer);
        }
    }


    /** Snapshot used by the Telegram /status command. */
    getInfo() {
        return {
            sessionId: this.sessionId,
            phone: this.phoneNumber || '',
            connected: !!this.connected,
            running: !!this.running,
            reconnectAttempts: this.reconnectAttempts || 0,
            lastOpenAt: this.lastOpenAt || 0,
            lastIncomingAt: this.lastIncomingAt || 0,
            lastSendOkAt: (this.sock && this.sock.__lastSendOkAt) || 0,
            lastDisconnect: this.lastDisconnect || null
        };
    }


    /**
     * Called by the manager sweeper: make sure this connection is really alive.
     * Returns true if it had to kick a reconnect.
     */
    ensureAlive() {

        if (this.manualStop || !this.running || this.pairingInProgress) {
            return false;
        }

        if (this.pairWaitUntil && Date.now() < this.pairWaitUntil) {
            return false; // waiting for the user to enter the pairing code
        }

        if (this.connected || this.reconnectTimer || this.reconnectInProgress) {
            return false;
        }

        // Not connected, nothing scheduled: it is stuck. Kick it.
        logger.warn(`[Connection] ensureAlive: stuck, reconnecting (${this.sessionId})`);
        this._scheduleReconnect(false, true);
        return true;
    }


    /* =================================================
     * AUTO RECONNECT
     * ================================================= */

    _scheduleReconnect(forceConflict = false, immediate = false, minDelayMs = 0) {

        if (
            !config.baileys?.autoReconnect
        ) {
            return;
        }

        if (
            this.manualStop
        ) {
            return;
        }

        if (
            this.reconnectTimer
        ) {
            return;
        }

        this.reconnectAttempts += 1;

        // Fast first retries (1s, 2s, 4s ...), never longer than 30s, always
        // retry forever. A little jitter so 700 sessions never reconnect at
        // the same second after a network blip.
        const cap = Number(process.env.WA_RECONNECT_MAX_MS) || 30000;
        const base = forceConflict ? 8000 : 1000;

        let delay;

        if (immediate && this.reconnectAttempts <= 2) {
            delay = 300 + Math.floor(Math.random() * 500);
        } else {
            delay = Math.min(
                base * Math.pow(2, Math.min(this.reconnectAttempts - 1, 6)),
                cap
            ) + Math.floor(Math.random() * 2500);
        }

        if (minDelayMs > delay) delay = minDelayMs;

        logger.info(
            `[Connection] Reconnect attempt #${this.reconnectAttempts} in ${Math.round(delay)}ms: ${this.sessionId}`
        );

        this.reconnectTimer =
            setTimeout(
                async () => {

                    this.reconnectTimer =
                        null;

                    if (
                        this.manualStop
                    ) {
                        return;
                    }

                    try {

                        this.reconnectInProgress = true;
                        this.socketGeneration += 1;

                        const oldSocket =
                            this.sock;

                        this.sock =
                            null;

                        this.connected =
                            false;

                        this.pairingCodeRequested = false;
                        this.pairingInProgress = false;

                        try {
                            await Session.updateOne(
                                { sessionId: this.sessionId },
                                {
                                    $set: {
                                        status: 'reconnecting',
                                        isActive: true,
                                        lastSeenAt: new Date()
                                    }
                                }
                            );
                        } catch (_) {}

                        if (oldSocket) {

                            try {
                                oldSocket.ev.removeAllListeners();
                            } catch (_) {}

                            try {
                                oldSocket.end(
                                    undefined
                                );
                            } catch (_) {}

                            // Let the old socket finish writing its encryption keys to
                            // disk BEFORE the new one reads them. Two overlapping states
                            // for one number = stale keys = "Bad MAC".
                            try { if (this.flushAuth) await this.flushAuth(); } catch (_) {}
                            await new Promise(r => setTimeout(r, 1500));
                        }

                        this.running =
                            true;

                        await this._createSocket();

                    } catch (err) {

                        logger.error(
                            `[Connection] Reconnect failed (${this.sessionId}): ${err.message}`
                        );

                        if (
                            !this.manualStop &&
                            config.baileys?.autoReconnect
                        ) {

                            this._scheduleReconnect();
                        }
                    } finally {
                        this.reconnectInProgress = false;
                    }
                },
                delay
            );
    }


    /* =================================================
     * GET SOCKET
     * ================================================= */

    getSocket() {

        return this.sock;
    }


    /* =================================================
     * SEND MESSAGE
     * ================================================= */

    async sendMessage(
        jid,
        content,
        options = {}
    ) {

        if (!this.sock) {

            throw new Error(
                'Socket not ready'
            );
        }

        if (!this.connected) {

            throw new Error(
                'WhatsApp connection is not ready'
            );
        }

        return this.sock.sendMessage(
            jid,
            content,
            options
        );
    }
}


/* =====================================================
 * EXPORT
 * ===================================================== */

module.exports =
    BotConnection;

