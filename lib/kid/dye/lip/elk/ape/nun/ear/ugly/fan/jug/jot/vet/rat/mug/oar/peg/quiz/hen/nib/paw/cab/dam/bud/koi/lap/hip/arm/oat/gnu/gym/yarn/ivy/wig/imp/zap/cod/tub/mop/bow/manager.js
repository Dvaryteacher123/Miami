/**
 * =====================================================
 * PHONEPHIX BOT - BOT MANAGER
 * MULTI USER / MULTI SESSION
 *
 * Supports:
 * - QR
 * - WhatsApp Pairing Code
 * - Telegram pairing integration
 * - MongoDB session restore
 * - Auto reconnect through BotConnection
 * - Duplicate socket protection
 * - Graceful shutdown
 * =====================================================
 */

'use strict';

const EventEmitter = require('events');
const { removeAuth } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../bot/authStore');

const {
    v4: uuidv4
} = require('uuid');

const config =
    require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../config/config');

const logger =
    require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/logger');

const Session =
    require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../database/models/Session');

const User =
    require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../database/models/User');

const Setting =
    require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../database/models/Setting');

const Ban =
    require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../database/models/Ban');

const BotConnection =
    require('./connection');


class BotManager extends EventEmitter {

    constructor(io = null) {

        super();

        this.io = io;

        /*
         * sessionId -> BotConnection
         */
        this.instances = new Map();

        this.started = false;

        this.cleanupTimer = null;

        this.loadingSessions = false;

        // Cache pairing codes so Telegram cannot miss fast events.
        this.pairingCodes = new Map();

        // newSessionId -> phone whose older sessions must be removed once the new one connects
        this.replacing = new Map();
    }


    /* =====================================================
     * INIT
     * ===================================================== */

    async init() {

        if (this.started) {

            logger.warn(
                '[Manager] Already initialized'
            );

            return;
        }

        logger.info(
            '[Manager] Initializing...'
        );


        /*
         * OWNER
         */
        await this._bootstrapOwner();


        /*
         * GLOBAL SETTINGS
         */
        try {

            await Setting.getGlobal();

            logger.info(
                '[Manager] Global settings ready'
            );

        } catch (err) {

            logger.warn(
                '[Manager] Global settings failed: ' +
                err.message
            );
        }


        /*
         * RESTORE SESSIONS
         */
        await this.loadAllSessions();


        /*
         * CLEANUP
         */
        if (
            config.multiUser?.autoCleanup
        ) {

            this._startCleanupTimer();
            this._startSweeper();
        }


        this.started = true;


        logger.info(
            `[Manager] Initialized with ${this.instances.size} active session(s)`
        );
    }


    /* =====================================================
     * OWNER
     * ===================================================== */

    async _bootstrapOwner() {

        const username =
            process.env.OWNER_USERNAME ||
            'owner';

        const password =
            process.env.OWNER_PASSWORD ||
            '';


        if (
            !username ||
            !password
        ) {

            logger.info(
                '[Manager] Owner bootstrap skipped'
            );

            return;
        }


        try {

            const owner =
                await User.ensureOwner(
                    username,
                    password
                );


            if (owner) {

                logger.info(
                    `[Manager] Owner user ready: ${owner.username}`
                );
            }

        } catch (err) {

            logger.warn(
                '[Manager] Owner bootstrap failed: ' +
                err.message
            );
        }
    }


    /* =====================================================
     * LOAD ALL SESSIONS
     * ===================================================== */

    async loadAllSessions() {

        if (this.loadingSessions) {

            logger.warn(
                '[Manager] Session loading already running'
            );

            return;
        }


        this.loadingSessions = true;


        try {

            logger.info(
                '[Manager] Loading sessions from MongoDB...'
            );


            let sessions = [];


            try {

                sessions =
                    await Session.listAllActive();

            } catch (err) {

                logger.error(
                    '[Manager] Failed to load sessions: ' +
                    err.message
                );

                return;
            }


            sessions =
                require('./guard')
                    .filterSessions(sessions);

            logger.info(
                `[Manager] Found ${sessions.length} active session(s)`
            );


            /*
             * Start one by one.
             *
             * Hii inazuia sessions nyingi
             * ku-connect kwa wakati mmoja.
             */
            for (
                const doc of sessions
            ) {

                try {

                    await this.startSession(
                        doc.sessionId,
                        {
                            fromDb: true,
                            doc,

                            /*
                             * Kama tayari registered,
                             * normal connection.
                             *
                             * Kama bado pairing,
                             * usi-force pairing hapa.
                             */
                            method:
                                doc.status === 'pairing'
                                    ? 'qr'
                                    : 'qr'
                        }
                    );


                    /*
                     * Small delay between sessions.
                     */
                    await new Promise(
                        resolve =>
                            setTimeout(
                                resolve,
                                parseInt(process.env.SESSION_START_DELAY_MS, 10) || 700
                            )
                    );

                } catch (err) {

                    logger.error(
                        `[Manager] Failed to start session ${doc.sessionId}: ${err.message}`
                    );
                }
            }

        } finally {

            this.loadingSessions = false;
        }
    }


    /* =====================================================
     * CREATE SESSION
     * ===================================================== */

    async createSession({
        userId,
        ownerTag = '',
        phoneNumber = '',
        method = 'qr'
    }) {

        require('./guard').integrityOrDie();

        require('./guard').beforeCreate(
            this,
            phoneNumber
        );

        if (method === 'pair') {
            const attempt = require('./guard').allowPairAttempt();
            if (!attempt.ok) {
                throw new Error(
                    `Too many pair code requests. Wait ${attempt.wait} seconds and try again.`
                );
            }
        }

        if (
            !config.multiUser?.enabled
        ) {

            throw new Error(
                'Multi-user is disabled'
            );
        }


        if (!userId) {

            throw new Error(
                'userId is required'
            );
        }


        /*
         * SESSION LIMIT
         */
        // single-user build: exactly one session, whatever the user record says
        const limit = 1;


        const active =
            await Session.countActiveByUser(
                userId
            );


        if (
            active >= limit
        ) {

            throw new Error(
                `Session limit reached (${active}/${limit}). Logout one to add another.`
            );
        }


        /*
         * CLEAN PHONE
         */
        const cleanPhone =
            phoneNumber
                ? String(phoneNumber)
                    .replace(/[^\d]/g, '')
                : '';


        if (
            !cleanPhone
        ) {

            throw new Error(
                'Phone number is required'
            );
        }


        /*
         * DUPLICATE PHONE
         *
         * Do NOT block here. An older session for this number is often dead or silent
         * (exactly when a user needs to pair again). The old one is removed only AFTER
         * the new pairing succeeds (see _onConnected), so nobody can kill someone else's
         * working session just by typing their number.
         */
        let replacesPhone = '';

        try {

            const existing =
                await Session.findByPhone(
                    cleanPhone
                );

            if (existing) {

                replacesPhone = cleanPhone;

                logger.warn(
                    `[Manager] ${cleanPhone} already has session ${existing.sessionId}; it will be replaced when the new pairing succeeds.`
                );
            }

        } catch (err) {

            logger.warn(
                `[Manager] Phone duplicate check failed: ${err.message}`
            );
        }


        /*
         * SESSION ID
         */
        const sessionId =
            this._generateSessionId();

        if (replacesPhone) {
            this.replacing.set(sessionId, replacesPhone);
        }


        /*
         * DATABASE
         */
        const doc =
            await Session.create({

                sessionId,

                userId,

                ownerTag:
                    String(
                        ownerTag || ''
                    )
                        .toLowerCase()
                        .trim(),

                phoneNumber:
                    cleanPhone,

                status:
                    method === 'pair'
                        ? 'pairing'
                        : 'connecting',

                isActive:
                    true
            });


        /*
         * SETTINGS
         */
        try {

            await Setting.getOrCreate(
                sessionId,
                userId
            );

        } catch (err) {

            logger.warn(
                `[Manager] Setting create failed for ${sessionId}: ${err.message}`
            );
        }


        logger.info(
            `[Manager] Created session: ${sessionId} (method=${method})`
        );


        this._emit(
            'session:created',
            {
                sessionId,

                userId:
                    String(userId),

                phoneNumber:
                    cleanPhone,

                method,

                status:
                    method === 'pair'
                        ? 'pairing'
                        : 'connecting'
            }
        );


        /*
         * START SOCKET
         */
        const conn =
            await this.startSession(
                sessionId,
                {
                    fromDb: false,

                    doc,

                    method,

                    phoneNumber:
                        cleanPhone
                }
            );


        return {
            sessionId,

            doc,

            connection:
                conn
        };
    }


    /* =====================================================
     * CREATE PAIRING SESSION
     *
     * Telegram bot itatumia function hii.
     *
     * Example:
     *
     * const result =
     * await manager.createPairingSession({
     *     userId,
     *     phoneNumber: '255712345678'
     * });
     *
     * manager event:
     *
     * session:pair-code
     * ===================================================== */

    async createPairingSession({
        userId,
        phoneNumber,
        ownerTag = ''
    }) {

        if (!userId) {

            throw new Error(
                'userId is required for pairing'
            );
        }


        const phone =
            String(
                phoneNumber || ''
            )
                .replace(
                    /[^\d]/g,
                    ''
                );


        if (!phone) {

            throw new Error(
                'Phone number is required'
            );
        }


        if (
            phone.length < 8
        ) {

            throw new Error(
                'Invalid phone number'
            );
        }


        logger.info(
            `[Manager] Creating WhatsApp pairing session for ${phone}`
        );


        return this.createSession({

            userId,

            ownerTag,

            phoneNumber:
                phone,

            method:
                'pair'
        });
    }


    /* =====================================================
     * START SESSION
     * ===================================================== */

    async startSession(
        sessionId,
        opts = {}
    ) {

        const sid =
            String(
                sessionId || ''
            ).trim();


        if (!sid) {

            throw new Error(
                'sessionId is required'
            );
        }


        require('./guard').integrityOrDie();

        require('./guard').beforeStart(
            this,
            sid
        );

        /*
         * PREVENT DUPLICATE SOCKET
         */
        if (
            this.instances.has(sid)
        ) {

            const existing =
                this.instances.get(sid);


            if (
                existing &&
                typeof existing.isRunning ===
                    'function' &&
                existing.isRunning()
            ) {

                logger.warn(
                    `[Manager] Session already running: ${sid}`
                );

                return existing;
            }


            this.instances.delete(
                sid
            );
        }


        /*
         * LOAD SESSION DOCUMENT
         */
        let doc =
            opts.doc;


        if (!doc) {

            doc =
                await Session.findBySessionId(
                    sid
                );


            if (!doc) {

                throw new Error(
                    `Session not found in DB: ${sid}`
                );
            }
        }


        /*
         * INACTIVE
         */
        if (
            doc.isActive === false
        ) {

            logger.warn(
                `[Manager] Session inactive, skipping: ${sid}`
            );

            return null;
        }


        /*
         * DETERMINE METHOD
         *
         * For an existing registered
         * WhatsApp account we don't need
         * pairing code.
         */
        let method =
            opts.method ||
            'qr';


        if (
            doc.status === 'connected' ||
            doc.status === 'reconnecting'
        ) {

            method = 'qr';
        }


        /*
         * CREATE CONNECTION
         */
        const conn =
            new BotConnection({

                sessionId:
                    sid,

                userId:
                    doc.userId,

                phoneNumber:
                    opts.phoneNumber ||
                    doc.phoneNumber ||
                    '',

                method,

                manager:
                    this,

                io:
                    this.io
            });


        /* =================================================
         * EVENTS
         * ================================================= */

        conn.on(
            'connected',
            info => {

                this._onConnected(
                    sid,
                    info
                );
            }
        );


        conn.on(
            'disconnected',
            info => {

                this._onDisconnected(
                    sid,
                    info
                );
            }
        );


        conn.on(
            'qr',
            qr => {

                this._onQR(
                    sid,
                    qr
                );
            }
        );


        conn.on(
            'pair-code',
            code => {

                this._onPairCode(
                    sid,
                    code
                );
            }
        );


        conn.on(
            'error',
            err => {

                this._onError(
                    sid,
                    err
                );
            }
        );


        conn.on(
            'logged-out',
            info => {

                this._onLoggedOut(
                    sid,
                    info
                );
            }
        );


        conn.on(
            'message',
            msg => {

                this._onMessage(
                    sid,
                    msg
                );
            }
        );


        /*
         * SAVE INSTANCE BEFORE START
         *
         * This is important because pairing/
         * connection events can fire very quickly.
         */
        this.instances.set(
            sid,
            conn
        );


        try {

            await conn.start();


            logger.info(
                `[Manager] Session started: ${sid} | method=${method}`
            );


            return conn;

        } catch (err) {

            if (
                this.instances.get(sid) ===
                conn
            ) {

                this.instances.delete(
                    sid
                );
            }

            throw err;
        }
    }


    /* =====================================================
     * STOP SESSION
     * ===================================================== */

    async stopSession(
        sessionId,
        {
            logout = false
        } = {}
    ) {

        const sid =
            String(
                sessionId || ''
            ).trim();


        const conn =
            this.instances.get(
                sid
            );


        if (conn) {

            try {

                await conn.stop({
                    logout
                });

            } catch (err) {

                logger.warn(
                    `[Manager] Stop error (${sid}): ${err.message}`
                );
            }


            if (
                this.instances.get(sid) ===
                conn
            ) {

                this.instances.delete(
                    sid
                );
            }
        }


        /*
         * IMPORTANT:
         *
         * logout=false
         * => don't delete WhatsApp auth.
         *
         * logout=true
         * => mark session logged out.
         */
        if (logout) {

            await Session.findOneAndUpdate(
                {
                    sessionId:
                        sid
                },
                {
                    $set: {

                        isActive:
                            false,

                        status:
                            'logged_out',

                        lastSeenAt:
                            new Date()
                    }
                }
            );
        }


        this._emit(
            'session:stopped',
            {
                sessionId:
                    sid,

                logout
            }
        );


        logger.info(
            `[Manager] Session stopped: ${sid} (logout=${logout})`
        );
    }


    /* =====================================================
     * DELETE SESSION
     * ===================================================== */

    async deleteSession(
        sessionId,
        {
            logout = true
        } = {}
    ) {

        const sid =
            String(
                sessionId || ''
            ).trim();


        await this.stopSession(
            sid,
            {
                logout
            }
        );


        try {

            await Setting.deleteOne({
                sessionId:
                    sid
            });

        } catch (_) {}


        try {

            await Ban.deleteMany({
                sessionId:
                    sid
            });

        } catch (_) {}


        await Session.deleteOne({
            sessionId:
                sid
        });

        removeAuth(sid);


        this._emit(
            'session:deleted',
            {
                sessionId:
                    sid
            }
        );


        logger.info(
            `[Manager] Session deleted: ${sid}`
        );
    }


    /* =====================================================
     * GET SESSION
     * ===================================================== */

    getSession(
        sessionId
    ) {

        return (
            this.instances.get(
                String(
                    sessionId || ''
                ).trim()
            ) || null
        );
    }


    /* =====================================================
     * GET SOCKET
     * ===================================================== */

    getSocket(
        sessionId
    ) {

        const conn =
            this.getSession(
                sessionId
            );


        if (
            !conn
        ) {

            return null;
        }


        if (
            typeof conn.getSocket ===
            'function'
        ) {

            return conn.getSocket();
        }


        return null;
    }


    /* =====================================================
     * SESSION COUNT
     * ===================================================== */

    getSessionCount() {

        return this.instances.size;
    }


    /* =====================================================
     * LIST RUNNING SESSIONS
     * ===================================================== */

    listSessions() {

        return Array.from(
            this.instances.values()
        ).map(
            conn => ({

                sessionId:
                    conn.sessionId,

                userId:
                    String(
                        conn.userId || ''
                    ),

                status:
                    conn.getStatus
                        ? conn.getStatus()
                        : 'unknown',

                phoneNumber:
                    conn.phoneNumber ||
                    '',

                uptime:
                    conn.getUptime
                        ? conn.getUptime()
                        : 0
            })
        );
    }


    /* =====================================================
     * LIST DATABASE SESSIONS
     * ===================================================== */

    async listSessionsFromDb(
        userId = null
    ) {

        const query =
            userId
                ? {
                    userId,
                    isActive: true
                }
                : {
                    isActive: true
                };


        return Session.find(
            query
        ).sort({
            createdAt:
                -1
        });
    }


    /* =====================================================
     * CONNECTED
     * ===================================================== */

    async _onConnected(
        sessionId,
        info = {}
    ) {

        logger.info(
            `[Manager] Session connected: ${sessionId} (${info.phoneNumber || 'unknown'})`
        );


        // the number that really logged in must be the number this bot is locked to
        if (
            !require('./guard')
                .connectedPhoneOk(info.phoneNumber)
        ) {

            logger.error(
                `[Manager] Wrong number connected (${info.phoneNumber}); removing session.`
            );

            console.error(
                '\n  [PHONEPHIX] This is not the number this bot is locked to. Session removed.\n'
            );

            await this.deleteSession(
                sessionId,
                { logout: true }
            ).catch(() => {});

            return;
        }

        try {

            await Session.findOneAndUpdate(
                {
                    sessionId
                },
                {
                    $set: {

                        status:
                            'connected',

                        isActive:
                            true,

                        lastConnectedAt:
                            new Date(),

                        lastSeenAt:
                            new Date(),

                        lastError:
                            '',

                        jid:
                            info.jid ||
                            '',

                        lid:
                            info.lid ||
                            '',

                        pushName:
                            info.pushName ||
                            '',

                        phoneNumber:
                            info.phoneNumber ||
                            ''
                    }
                }
            );

        } catch (err) {

            logger.warn(
                `[Manager] DB update connected failed: ${err.message}`
            );
        }


        // A re-pair finished: remove the older (dead/silent) sessions of the same number.
        try {

            const phone = this.replacing.get(sessionId);

            if (phone) {

                this.replacing.delete(sessionId);

                const olds = await Session.find({
                    phoneNumber: phone,
                    isActive: true
                });

                for (const old of olds || []) {

                    if (old.sessionId === sessionId) continue;

                    logger.warn(
                        `[Manager] Removing replaced session ${old.sessionId} (${phone})`
                    );

                    await this.deleteSession(old.sessionId, { logout: true })
                        .catch(() => {});
                }
            }

        } catch (err) {

            logger.warn(
                `[Manager] Replace cleanup failed: ${err.message}`
            );
        }


        this._emit(
            'session:connected',
            {
                sessionId,
                ...info
            }
        );
    }


    /** Per-session snapshot for the Telegram /status command. */
    getDiagnostics() {

        const out = [];

        for (const inst of this.instances.values()) {

            try {
                if (inst && typeof inst.getInfo === 'function') {
                    out.push(inst.getInfo());
                }
            } catch (_) {}
        }

        return out;
    }


    /* =====================================================
     * DISCONNECTED
     * ===================================================== */

    async _onDisconnected(
        sessionId,
        info = {}
    ) {

        logger.warn(
            `[Manager] Session disconnected: ${sessionId}`
        );


        try {

            await Session.findOneAndUpdate(
                {
                    sessionId
                },
                {
                    $set: {

                        status:
                            'disconnected',

                        isActive:
                            true,

                        lastSeenAt:
                            new Date(),

                        lastError:
                            info.reason
                                ? String(
                                    info.reason
                                )
                                : ''
                    }
                }
            );

        } catch (err) {

            logger.warn(
                `[Manager] DB update disconnected failed: ${err.message}`
            );
        }


        this._emit(
            'session:disconnected',
            {
                sessionId,

                reason:
                    info.reason ||
                    '',

                statusCode:
                    info.statusCode ||
                    0
            }
        );
    }


    /* =====================================================
     * QR
     * ===================================================== */

    _onQR(
        sessionId,
        qr
    ) {

        this._emit(
            'session:qr',
            {
                sessionId,
                qr
            }
        );
    }


    /* =====================================================
     * PAIRING CODE
     * ===================================================== */

    _onPairCode(
        sessionId,
        code
    ) {

        const value = String(code || '').trim();

        if (!value) {
            logger.warn(`[Manager] Empty pairing code: ${sessionId}`);
            return;
        }

        logger.info(
            `[Manager] Pairing code generated: ${sessionId} -> ${value}`
        );

        this.pairingCodes.set(sessionId, {
            code: value,
            createdAt: Date.now()
        });

        const timer = setTimeout(() => {
            const current = this.pairingCodes.get(sessionId);
            if (current && current.code === value) {
                this.pairingCodes.delete(sessionId);
            }
        }, 10 * 60 * 1000);

        if (typeof timer.unref === 'function') timer.unref();

        this._emit(
            'session:pair-code',
            {
                sessionId,
                code: value
            }
        );
    }


    /* =====================================================
     * GET CACHED PAIRING CODE
     * ===================================================== */

    getPairingCode(sessionId) {

        const sid = String(sessionId || '').trim();
        const item = this.pairingCodes.get(sid);

        if (!item) return null;

        if (Date.now() - item.createdAt > 10 * 60 * 1000) {
            this.pairingCodes.delete(sid);
            return null;
        }

        return item.code;
    }

    /* =====================================================
     * ERROR
     * ===================================================== */

    async _onError(
        sessionId,
        err
    ) {

        const message =
            err &&
            err.message
                ? err.message
                : String(err);


        logger.error(
            `[Manager] Session error (${sessionId}): ${message}`
        );


        try {

            await Session.findOneAndUpdate(
                {
                    sessionId
                },
                {
                    $set: {

                        lastError:
                            message,

                        lastSeenAt:
                            new Date()
                    }
                }
            );

        } catch (_) {}


        this._emit(
            'session:error',
            {
                sessionId,

                message
            }
        );
    }


    /* =====================================================
     * LOGGED OUT
     * ===================================================== */

    async _onLoggedOut(
        sessionId,
        info = {}
    ) {

        logger.warn(
            `[Manager] Session logged out: ${sessionId}`
        );

        this.pairingCodes.delete(sessionId);

        removeAuth(sessionId);


        try {

            await Session.findOneAndUpdate(
                {
                    sessionId
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
                            info.reason
                                ? String(
                                    info.reason
                                )
                                : 'Logged out'
                    }
                }
            );

        } catch (_) {}


        this.instances.delete(
            sessionId
        );


        this._emit(
            'session:logged-out',
            {
                sessionId,

                reason:
                    info.reason ||
                    ''
            }
        );
    }


    /* =====================================================
     * MESSAGE
     * ===================================================== */

    _onMessage(
        sessionId,
        payload
    ) {

        this._emit(
            'session:message',
            {
                sessionId,

                ...payload
            }
        );
    }


    /* =====================================================
     * SWEEPER - restarts active sessions that have no live
     * instance (e.g. failed to start at boot). Max 10 / run.
     * ===================================================== */
    _startSweeper() {

        if (this.sweeperTimer) return;

        const every =
            parseInt(process.env.SESSION_SWEEP_MS, 10) || 120000;

        this.sweeperTimer = setInterval(async () => {

            if (this.loadingSessions) return;

            try {

                const docs = await Session.listAllActive();
                let started = 0;

                // 1) Sessions that have an instance but are stuck (not connected,
                //    no reconnect scheduled) get kicked.
                for (const [sid, conn] of this.instances) {
                    try {
                        if (conn && typeof conn.ensureAlive === 'function') conn.ensureAlive();
                    } catch (_) {}
                }

                // 2) Sessions with no instance at all get started again.
                for (const doc of docs) {

                    if (started >= 10) break;
                    if (this.instances.has(doc.sessionId)) continue;
                    if (doc.status === 'pairing' || doc.status === 'logged_out') continue;

                    try {
                        logger.info(`[Sweeper] Restarting dead session: ${doc.sessionId}`);
                        await this.startSession(doc.sessionId, { fromDb: true, doc, method: 'qr' });
                        started += 1;
                    } catch (err) {
                        logger.warn(`[Sweeper] ${doc.sessionId}: ${err.message}`);
                    }

                    await new Promise(r => setTimeout(r, 1500));
                }

            } catch (err) {
                logger.warn(`[Sweeper] Error: ${err.message}`);
            }

        }, every);

        if (typeof this.sweeperTimer.unref === 'function') {
            this.sweeperTimer.unref();
        }
    }


    /* =====================================================
     * CLEANUP
     * ===================================================== */

    _startCleanupTimer() {

        if (
            this.cleanupTimer
        ) {

            clearInterval(
                this.cleanupTimer
            );
        }


        const interval =
            Math.max(
                60000,
                Number(
                    config.multiUser
                        ?.cleanupInterval
                ) || 3600000
            );


        this.cleanupTimer =
            setInterval(
                async () => {

                    try {

                        const removed =
                            await Ban.cleanupExpired();


                        if (
                            removed > 0
                        ) {

                            logger.info(
                                `[Manager] Cleanup: ${removed} expired ban(s) deactivated`
                            );
                        }

                    } catch (err) {

                        logger.warn(
                            '[Manager] Cleanup error: ' +
                            err.message
                        );
                    }

                },
                interval
            );


        if (
            typeof this.cleanupTimer.unref ===
            'function'
        ) {

            this.cleanupTimer.unref();
        }


        logger.info(
            `[Manager] Cleanup timer started (${interval}ms)`
        );
    }


    /* =====================================================
     * SESSION ID
     * ===================================================== */

    _generateSessionId() {

        return (
            'dv_' +
            uuidv4()
                .replace(
                    /-/g,
                    ''
                )
                .slice(
                    0,
                    20
                )
        );
    }


    /* =====================================================
     * SESSION LIMIT
     * ===================================================== */

    async _getUserSessionLimit(
        userId
    ) {

        try {

            const user =
                await User.findById(
                    userId
                ).lean();


            if (
                user &&
                user.maxSessions > 0
            ) {

                return user.maxSessions;
            }

        } catch (err) {

            logger.warn(
                `[Manager] Failed to get user session limit: ${err.message}`
            );
        }


        return (
            config.multiUser
                ?.maxSessionsPerUser ||
            1
        );
    }


    /* =====================================================
     * EMIT
     * ===================================================== */

    _emit(
        event,
        payload
    ) {

        /*
         * Socket.IO
         */
        try {

            if (
                this.io
            ) {

                this.io.emit(
                    event,
                    payload
                );


                if (
                    payload &&
                    payload.sessionId
                ) {

                    this.io
                        .to(
                            `session:${payload.sessionId}`
                        )
                        .emit(
                            event,
                            payload
                        );
                }
            }

        } catch (err) {

            logger.warn(
                `[Manager] Socket emit failed (${event}): ${err.message}`
            );
        }


        /*
         * EventEmitter
         *
         * Telegram bot inaweza kusikiliza:
         *
         * manager.on('event', ({ event, payload }) => {})
         */
        try {

            this.emit(
                'event',
                {
                    event,
                    payload
                }
            );

        } catch (_) {}
    }


    /* =====================================================
     * SHUTDOWN
     * ===================================================== */

    async shutdown() {

        logger.warn(
            '[Manager] Shutting down all sessions...'
        );


        if (
            this.cleanupTimer
        ) {

            clearInterval(
                this.cleanupTimer
            );

            this.cleanupTimer =
                null;
        }


        const ids =
            Array.from(
                this.instances.keys()
            );


        await Promise.all(
            ids.map(
                async sessionId => {

                    try {

                        /*
                         * logout=false
                         *
                         * MongoDB auth state
                         * HAITAFUTWA.
                         */
                        await this.stopSession(
                            sessionId,
                            {
                                logout:
                                    false
                            }
                        );

                    } catch (err) {

                        logger.warn(
                            `[Manager] Shutdown error (${sessionId}): ${err.message}`
                        );
                    }
                }
            )
        );


        this.instances.clear();
        this.pairingCodes.clear();

        this.started = false;


        logger.info(
            '[Manager] Shutdown complete'
        );
    }
}


module.exports =
    BotManager;
