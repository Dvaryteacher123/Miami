'use strict';

const Setting =
    require('../database/models/Setting');

function normalizeJid(jid) {
    if (jid && typeof jid === 'object') jid = jid.id || jid.jid || jid.lid || '';
    return String(jid || '')
        .trim()
        .replace(/^whatsapp:/i, '');
}

function phoneFromJid(jid) {
    return normalizeJid(jid)
        .split(':')[0]
        .split('@')[0]
        .replace(/[^\d]/g, '');
}

async function getProfilePicture(sock, jid) {
    try {
        return await sock.profilePictureUrl(
            jid,
            'image'
        );
    } catch (_) {
        return null;
    }
}


/* Works with plain strings AND Baileys-7 objects ({ id, phoneNumber, lid }) and @lid groups */
function resolveMember(sock, participant, meta) {
    const isObj = participant && typeof participant === 'object';
    const id = normalizeJid(isObj ? (participant.id || participant.jid || participant.lid) : participant);
    let phoneJid = isObj ? normalizeJid(participant.phoneNumber || participant.jid || '') : '';

    if (!phoneJid && id.endsWith('@s.whatsapp.net')) phoneJid = id;

    if (!phoneJid && meta && Array.isArray(meta.participants)) {
        const hit = meta.participants.find((x) =>
            normalizeJid(x.id) === id || normalizeJid(x.lid) === id || normalizeJid(x.jid) === id);
        if (hit) phoneJid = normalizeJid(hit.phoneNumber || hit.jid || '');
    }
    if (!phoneJid && id.endsWith('@lid')) {
        try {
            const m = sock.signalRepository && sock.signalRepository.lidMapping;
            const pn = m && m.getPNForLID ? m.getPNForLID(id) : null;
            if (pn && typeof pn.then !== 'function') phoneJid = normalizeJid(pn);
        } catch (_) {}
    }

    const phone = phoneFromJid(phoneJid || id);
    return { id, phoneJid, phone, mentionUser: phoneFromJid(id) };
}

module.exports = {

    name: 'group-participants.update',

    async execute(ctx) {

        const {
            sock,
            sessionId,
            userId,
            event
        } = ctx;

        if (!sock || !event) {
            return;
        }

        const groupId =
            normalizeJid(event.id);

        if (!groupId) {
            return;
        }

        let settings;

        try {

            settings =
                await Setting.getOrCreate(
                    sessionId,
                    userId
                );

        } catch (error) {

            console.error(
                '[GROUP EVENT] Settings error:',
                error
            );

            return;
        }

        if (!settings.metadata) {
            settings.metadata = {};
        }

        if (!settings.metadata.groups) {
            settings.metadata.groups = {};
        }

        const groupSettings =
            settings.metadata.groups[groupId] || {};

        /*
        |--------------------------------------------------------------------------
        | ANTIPROMOTE / ANTIDEMOTE
        | .antipromote on  -> anyone promoted by a normal admin is demoted again
        | .antidemote on   -> anyone demoted by a normal admin is promoted again
        | (the bot owner and the bot itself are allowed to promote/demote)
        |--------------------------------------------------------------------------
        */
        if ((event.action === 'promote' && groupSettings.antipromote === true) ||
            (event.action === 'demote' && groupSettings.antidemote === true)) {
            try {
                const botNum = phoneFromJid(sock.user && sock.user.id);
                const author = normalizeJid(event.author);
                const authorNum = phoneFromJid(author);
                const ownerNum = String(require('../config/config').bot.ownerNumber || '').replace(/[^\d]/g, '');
                const allowed = !author || authorNum === botNum || (ownerNum && authorNum === ownerNum);
                if (!allowed) {
                    const undo = event.action === 'promote' ? 'demote' : 'promote';
                    const targets = (event.participants || []).map((p) => normalizeJid(p)).filter(Boolean);
                    await sock.groupParticipantsUpdate(groupId, targets, undo);
                    await sock.sendMessage(groupId, {
                        text: event.action === 'promote'
                            ? `🛡️ *ANTIPROMOTE*\n\n@${authorNum || 'admin'} tried to promote someone. The change was undone.`
                            : `🛡️ *ANTIDEMOTE*\n\n@${authorNum || 'admin'} tried to demote someone. The change was undone.`,
                        mentions: author ? [author] : []
                    });
                }
            } catch (error) {
                console.error('[ANTIPROMOTE/ANTIDEMOTE]', error && error.message ? error.message : error);
            }
        }

        /* Fill {user} {group} {count} in custom welcome/goodbye text */
        let groupName = '';
        let groupCount = 0;
        let groupMeta = null;
        try {
            const gm = await sock.groupMetadata(groupId);
            groupMeta = gm;
            groupName = gm.subject || '';
            groupCount = (gm.participants || []).length;
        } catch (_) { /* metadata unavailable */ }

        const fill = (tpl, phone, name = '') =>
            String(tpl)
                .replace(/\{name\}/gi, name || `@${phone}`)
                .replace(/\{user\}/gi, `@${phone}`)
                .replace(/\{group\}/gi, groupName)
                .replace(/\{count\}/gi, String(groupCount));

        /*
        |--------------------------------------------------------------------------
        | BLACKLIST (auto-remove blacklisted numbers when they join)
        |--------------------------------------------------------------------------
        */

        let removedByBlacklist = new Set();

        if (
            event.action === 'add' &&
            Array.isArray(groupSettings.blacklist) &&
            groupSettings.blacklist.length
        ) {
            for (const participant of event.participants || []) {
                const jid = normalizeJid(participant);
                const phone = phoneFromJid(jid);

                if (!phone || !groupSettings.blacklist.includes(phone)) continue;

                try {
                    await sock.groupParticipantsUpdate(groupId, [jid], 'remove');
                    removedByBlacklist.add(jid);
                    await sock.sendMessage(groupId, {
                        text: `⛔ @${phone} is blacklisted and was removed automatically.`,
                        mentions: [jid]
                    });
                } catch (error) {
                    console.error('[BLACKLIST ERROR]', error && error.message ? error.message : error);
                }
            }
        }

        /*
        |--------------------------------------------------------------------------
        | WELCOME
        |--------------------------------------------------------------------------
        */

        if (
            event.action === 'add' &&
            groupSettings.welcome === true
        ) {

            const participants =
                event.participants || [];

            for (const participant of participants) {

                const member = resolveMember(sock, participant, groupMeta);
                const jid = member.id;

                if (!jid) continue;
                if (removedByBlacklist.has(jid)) continue;

                const phone = member.phone;          // real number (shown as +number)
                const tagUser = member.mentionUser;  // what WhatsApp needs after the @ so it becomes a tag

                // profile picture: try the id first, then the phone JID
                let image = await getProfilePicture(sock, jid);
                if (!image && member.phoneJid && member.phoneJid !== jid) {
                    image = await getProfilePicture(sock, member.phoneJid);
                }

                const nc = require('../utils/nameCache');
                const name = nc.get(jid) || nc.get(member.phoneJid) || (participant && participant.name) || (participant && participant.notify) || '';

                // fallback picture when the person has no (or a hidden) profile photo
                let fallback = null;
                if (!image) {
                    try {
                        const fs = require('fs');
                        const path = require('path');
                        const f = path.join(__dirname, '..', 'public', 'images', 'menu.jpg');
                        if (fs.existsSync(f)) fallback = fs.readFileSync(f);
                    } catch (_) {}
                }

                const caption = groupSettings.welcomeText
                    ? fill(groupSettings.welcomeText, tagUser, name)
                    : `👋 *WELCOME${groupName ? ' TO ' + groupName.toUpperCase() : ''}!*\n\n` +
                      `Karibu @${tagUser} 🎉\n` +
                      (name ? `👤 Name: *${name}*\n` : '') +
                      `📞 Number: +${phone}\n` +
                      (groupCount ? `👥 You are member *#${groupCount}*\n` : '') +
                      `\n` +
                      `🤝 Respect other members.\n` +
                      `🚫 No spam or unauthorized links.\n` +
                      `❤️ Enjoy your stay!`;

                const pic = image ? { url: image } : fallback;

                try {

                    if (pic) {

                        await sock.sendMessage(
                            groupId,
                            {
                                image: pic,
                                caption,
                                mentions: [jid]
                            },
                            { brand: true }
                        );

                    } else {

                        await sock.sendMessage(
                            groupId,
                            {
                                text: caption,
                                mentions: [jid]
                            },
                            { brand: true }
                        );
                    }

                } catch (error) {

                    console.error(
                        '[WELCOME SEND ERROR]',
                        error
                    );
                }
            }
        }

        /*
        |--------------------------------------------------------------------------
        | GOODBYE
        |--------------------------------------------------------------------------
        */

        if (
            (
                event.action === 'remove' ||
                event.action === 'leave'
            ) &&
            groupSettings.goodbye === true
        ) {

            const participants =
                event.participants || [];

            for (const participant of participants) {

                const jid =
                    normalizeJid(participant);

                const phone =
                    phoneFromJid(jid);

                const text = groupSettings.goodbyeText
                    ? fill(groupSettings.goodbyeText, phone)
                    : `👋 *GOODBYE*\n\n` +
                      `@${phone} has left the group.\n\n` +
                      `We wish them all the best. ❤️`;

                try {

                    await sock.sendMessage(
                        groupId,
                        {
                            text,
                            mentions: [jid]
                        }
                    );

                } catch (error) {

                    console.error(
                        '[GOODBYE SEND ERROR]',
                        error
                    );
                }
            }
        }
    }
};
