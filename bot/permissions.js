/**
 * =====================================================
 * PHONEPHIX BOT - PERMISSIONS
 * Group Admin / Owner Permission System
 * =====================================================
 */

'use strict';

// =====================================================
// JID HELPERS
// =====================================================

function normalizeJid(jid) {
    if (!jid) return '';
    return String(jid).trim();
}

function phoneFromJid(jid) {
    if (!jid) return '';

    return String(jid)
        .split(':')[0]
        .split('@')[0]
        .replace(/[^\d]/g, '');
}

function isLidJid(jid) {
    return String(jid || '').endsWith('@lid');
}

function isGroupJid(jid) {
    return (
        typeof jid === 'string' &&
        jid.endsWith('@g.us')
    );
}

// =====================================================
// JID COMPARISON
// =====================================================

function sameJid(a, b) {
    if (!a || !b) return false;

    a = normalizeJid(a);
    b = normalizeJid(b);

    // Exact match
    if (a === b) {
        return true;
    }

    // Do not compare LID with phone JID
    if (
        isLidJid(a) ||
        isLidJid(b)
    ) {
        return false;
    }

    const phoneA = phoneFromJid(a);
    const phoneB = phoneFromJid(b);

    if (!phoneA || !phoneB) {
        return false;
    }

    return phoneA === phoneB;
}

// =====================================================
// SENDER JIDS
// =====================================================

function getSenderJids(
    senderJid,
    alternateJid = null
) {
    return [
        senderJid,
        alternateJid
    ]
        .filter(Boolean)
        .map(normalizeJid)
        .filter(
            (jid, index, array) =>
                array.indexOf(jid) === index
        );
}

// =====================================================
// GROUP METADATA
// =====================================================

async function getGroupMetadata(
    sock,
    groupJid,
    store = null
) {
    try {
        if (!sock) {
            return null;
        }

        if (!isGroupJid(groupJid)) {
            return null;
        }

        let metadata = null;

        // -------------------------------------------------
        // 1. Try custom store
        // -------------------------------------------------

        if (
            store &&
            typeof store.fetchGroupMetadata === 'function'
        ) {
            try {
                metadata =
                    await store.fetchGroupMetadata(
                        groupJid,
                        sock
                    );
            } catch (storeError) {
                console.warn(
                    `[Permissions] Store metadata failed: ${storeError.message}`
                );
            }
        }

        // -------------------------------------------------
        // 2. Fallback to Baileys
        // -------------------------------------------------

        if (
            !metadata ||
            !Array.isArray(metadata.participants)
        ) {
            try {
                metadata =
                    await sock.groupMetadata(
                        groupJid
                    );
            } catch (baileysError) {
                console.error(
                    `[Permissions] groupMetadata failed: ${baileysError.message}`
                );

                return null;
            }
        }

        return metadata;

    } catch (error) {
        console.error(
            `[Permissions] Metadata error: ${error.message}`
        );

        return null;
    }
}

// =====================================================
// FIND PARTICIPANT
// =====================================================

function findParticipant(
    participants,
    senderJids
) {
    if (
        !Array.isArray(participants) ||
        participants.length === 0
    ) {
        return null;
    }

    if (!Array.isArray(senderJids)) {
        senderJids = [senderJids];
    }

    const senders = senderJids
        .filter(Boolean)
        .map(normalizeJid);

    // -------------------------------------------------
    // 1. Exact JID match
    // -------------------------------------------------

    let participant = participants.find(
        participant => {
            if (!participant?.id) {
                return false;
            }

            const participantId =
                normalizeJid(
                    participant.id
                );

            return senders.some(
                sender =>
                    participantId === sender
            );
        }
    );

    if (participant) {
        return participant;
    }

    // -------------------------------------------------
    // 2. Phone number match
    // -------------------------------------------------

    participant = participants.find(
        participant => {
            if (!participant?.id) {
                return false;
            }

            if (
                isLidJid(
                    participant.id
                )
            ) {
                return false;
            }

            return senders.some(
                sender => {

                    if (isLidJid(sender)) {
                        return false;
                    }

                    return sameJid(
                        participant.id,
                        sender
                    );
                }
            );
        }
    );

    if (participant) {
        return participant;
    }

    // -------------------------------------------------
    // 3. phoneNumber fallback
    // -------------------------------------------------

    participant = participants.find(
        participant => {

            if (!participant?.phoneNumber) {
                return false;
            }

            if (
                isLidJid(
                    participant.phoneNumber
                )
            ) {
                return false;
            }

            return senders.some(
                sender => {

                    if (isLidJid(sender)) {
                        return false;
                    }

                    return sameJid(
                        participant.phoneNumber,
                        sender
                    );
                }
            );
        }
    );

    return participant || null;
}

// =====================================================
// GROUP ADMIN CHECK
// =====================================================

async function isGroupAdmin(
    sock,
    groupJid,
    senderJid,
    store = null,
    alternateJid = null
) {
    try {

        if (!sock) {
            return false;
        }

        if (!isGroupJid(groupJid)) {
            return false;
        }

        if (!senderJid) {
            return false;
        }

        const metadata =
            await getGroupMetadata(
                sock,
                groupJid,
                store
            );

        if (!metadata) {
            return false;
        }

        const participants =
            metadata.participants || [];

        const senderJids =
            getSenderJids(
                senderJid,
                alternateJid
            );

        const participant =
            findParticipant(
                participants,
                senderJids
            );

        if (!participant) {
            return false;
        }

        // Baileys normally uses:
        //
        // admin: 'admin'
        // admin: 'superadmin'
        //
        // Some wrappers may expose boolean values.

        if (
            participant.admin === 'admin' ||
            participant.admin === 'superadmin'
        ) {
            return true;
        }

        if (
            participant.isAdmin === true ||
            participant.isSuperAdmin === true
        ) {
            return true;
        }

        return false;

    } catch (error) {

        console.error(
            `[Permissions] isGroupAdmin error: ${error.message}`
        );

        // Security:
        // If we cannot verify the admin,
        // deny permission.
        return false;
    }
}

// =====================================================
// GROUP OWNER / SUPER ADMIN
// =====================================================

async function isGroupOwner(
    sock,
    groupJid,
    senderJid,
    store = null,
    alternateJid = null
) {
    try {

        if (!sock) {
            return false;
        }

        if (!isGroupJid(groupJid)) {
            return false;
        }

        const metadata =
            await getGroupMetadata(
                sock,
                groupJid,
                store
            );

        if (!metadata) {
            return false;
        }

        const participants =
            metadata.participants || [];

        const senderJids =
            getSenderJids(
                senderJid,
                alternateJid
            );

        const participant =
            findParticipant(
                participants,
                senderJids
            );

        if (!participant) {
            return false;
        }

        return (
            participant.admin === 'superadmin' ||
            participant.isSuperAdmin === true
        );

    } catch (error) {

        console.error(
            `[Permissions] isGroupOwner error: ${error.message}`
        );

        return false;
    }
}

// =====================================================
// SESSION OWNER
// =====================================================

/**
 * Owner wa SESSION hii ya WhatsApp.
 *
 * Mfano:
 *
 * Session A
 *  -> +255700000001
 *
 * Session B
 *  -> +255700000002
 *
 * Kila session ina owner wake.
 */

function isSessionOwner(
    senderJid,
    sock,
    alternateJid = null
) {
    try {

        if (!sock?.user?.id) {
            return false;
        }

        const sessionOwnerJid =
            normalizeJid(
                sock.user.id
            );

        const senderJids =
            getSenderJids(
                senderJid,
                alternateJid
            );

        return senderJids.some(
            sender =>
                sameJid(
                    sessionOwnerJid,
                    sender
                )
        );

    } catch (error) {

        console.error(
            `[Permissions] Session owner error: ${error.message}`
        );

        return false;
    }
}

// =====================================================
// BOT OWNER
// =====================================================

/**
 * Global bot owner.
 *
 * Hii inaweza kutumika kwa commands
 * ambazo ni OWNER-ONLY kama:
 *
 * .pair
 * .sessions
 * .restart
 * .broadcast
 *
 * Lakini usiitumie kama bypass ya
 * group-admin commands.
 */

function isBotOwner(
    senderJid,
    ownerNumber,
    alternateJid = null
) {
    try {

        if (!ownerNumber) {
            return false;
        }

        const ownerPhone =
            phoneFromJid(
                String(ownerNumber)
            );

        if (!ownerPhone) {
            return false;
        }

        const senderJids =
            getSenderJids(
                senderJid,
                alternateJid
            );

        return senderJids.some(
            sender => {

                if (isLidJid(sender)) {
                    return false;
                }

                return (
                    phoneFromJid(sender) ===
                    ownerPhone
                );
            }
        );

    } catch (error) {

        console.error(
            `[Permissions] Bot owner error: ${error.message}`
        );

        return false;
    }
}

// =====================================================
// ADMIN COMMAND PERMISSION
// =====================================================

/**
 * Permission ya GROUP COMMAND.
 *
 * Inaruhusu:
 *
 * 1. Session Owner
 * 2. Group Admin
 * 3. Group Super Admin
 *
 * HAIJUMUISHA global bot owner.
 *
 * Hii ni muhimu kwenye multi-session bot:
 *
 * Session A
 * Session B
 * Session C
 *
 * Hazitakiwi kutumia BOT_OWNER
 * kama bypass ya kila session.
 */

async function canUseAdminCommand({
    sock,
    store,
    groupJid,
    senderJid,
    alternateJid = null,
    senderIsSessionOwner = false
}) {
    try {

        // -------------------------------------------------
        // Session owner
        // -------------------------------------------------

        if (senderIsSessionOwner) {
            return true;
        }

        // -------------------------------------------------
        // Group admin
        // -------------------------------------------------

        const admin =
            await isGroupAdmin(
                sock,
                groupJid,
                senderJid,
                store,
                alternateJid
            );

        if (admin) {
            return true;
        }

        return false;

    } catch (error) {

        console.error(
            `[Permissions] Admin command error: ${error.message}`
        );

        return false;
    }
}

// =====================================================
// GENERAL PERMISSION CHECK
// =====================================================

async function checkPermission({
    type,
    sock,
    store,
    groupJid,
    senderJid,
    alternateJid = null,
    ownerNumber = null
}) {
    try {

        // -------------------------------------------------
        // OWNER COMMAND
        // -------------------------------------------------

        if (type === 'owner') {

            return isBotOwner(
                senderJid,
                ownerNumber,
                alternateJid
            );
        }

        // -------------------------------------------------
        // GROUP ADMIN COMMAND
        // -------------------------------------------------

        if (type === 'admin') {

            const sessionOwner =
                isSessionOwner(
                    senderJid,
                    sock,
                    alternateJid
                );

            return await canUseAdminCommand({
                sock,
                store,
                groupJid,
                senderJid,
                alternateJid,
                senderIsSessionOwner:
                    sessionOwner
            });
        }

        // -------------------------------------------------
        // GROUP OWNER
        // -------------------------------------------------

        if (type === 'group-owner') {

            return await isGroupOwner(
                sock,
                groupJid,
                senderJid,
                store,
                alternateJid
            );
        }

        return false;

    } catch (error) {

        console.error(
            `[Permissions] checkPermission error: ${error.message}`
        );

        return false;
    }
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {

    // JID
    normalizeJid,
    phoneFromJid,
    isLidJid,
    isGroupJid,
    sameJid,
    getSenderJids,

    // Metadata
    getGroupMetadata,
    findParticipant,

    // Group permissions
    isGroupAdmin,
    isGroupOwner,

    // Owners
    isSessionOwner,
    isBotOwner,

    // Command permissions
    canUseAdminCommand,
    checkPermission
};
