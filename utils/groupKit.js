'use strict';

/**
 * =====================================================
 *  PHONEPHIX BOT - GROUP KIT
 *  Shared helper for group commands. Handles:
 *   - group-only / owner-only / admin-only / bot-admin checks
 *   - resolving a target (mention, reply, or number)
 *   - storing per-group settings (warns, rules, notes, etc.)
 *
 *  Usage:
 *    module.exports = defineGroup({
 *      name, aliases, description, usage,
 *      admin: true,      // sender must be a group admin
 *      botAdmin: true,   // bot must be an admin
 *      owner: true,      // bot owner only
 *      groupOnly: false, // allow outside groups
 *      async run(api) { ... }
 *    });
 * =====================================================
 */

const Setting = require('../database/models/Setting');

const num = (jid) =>
    String(jid || '').split(':')[0].split('@')[0].replace(/[^\d]/g, '');

const normJid = (jid) => {
    const [user, domain] = String(jid || '').split('@');
    return domain ? `${user.split(':')[0]}@${domain}` : String(jid || '');
};

const isAdminPart = (p) => !!(p && (p.admin === 'admin' || p.admin === 'superadmin'));

const partId = (p) => String((p && (p.id || p.jid)) || '');

/* Real phone number of a participant (works for @lid groups too when available) */
const phoneOf = (p) => {
    const cand = [p && p.phoneNumber, p && p.jid, p && p.id].filter(Boolean).map(String);
    const pn = cand.find((c) => /@s\.whatsapp\.net$/.test(c));
    return num(pn || cand[0] || '');
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Timers for closetime / opentime / tempmute / remindall (memory only) */
const timers = new Map();

function contextOf(msg) {
    let m = msg?.message || {};
    for (let i = 0; i < 3; i += 1) {
        const inner =
            m.ephemeralMessage?.message ||
            m.viewOnceMessage?.message ||
            m.viewOnceMessageV2?.message ||
            m.documentWithCaptionMessage?.message;
        if (!inner) break;
        m = inner;
    }
    for (const key of Object.keys(m)) {
        if (m[key] && typeof m[key] === 'object' && m[key].contextInfo) {
            return m[key].contextInfo;
        }
    }
    return {};
}

function stripCommand(raw, prefix, command) {
    let body = String(raw || '');
    const head = `${prefix || '.'}${command || ''}`;
    if (body.toLowerCase().startsWith(head.toLowerCase())) body = body.slice(head.length);
    return body.replace(/^[ \t]+/, '').replace(/\s+$/, '');
}

function niceError(error) {
    const msg = String((error && error.message) || error || '');
    if (/not-authorized|forbidden|401|403/i.test(msg)) {
        return "I don't have permission. Make sure the bot is a group *admin*.";
    }
    if (/item-not-found|404/i.test(msg)) return 'Not found (invalid group/member/link).';
    if (/rate-overlimit|429/i.test(msg)) return 'WhatsApp asked us to slow down. Try again in a moment.';
    if (/timed out|timeout/i.test(msg)) return 'Timed out. Try again.';
    return msg || 'Something went wrong.';
}

function defineGroup(def) {
    return {
        name: def.name,
        category: 'group',
        aliases: def.aliases || [],
        description: def.description || '',
        usage: `.${def.usage || def.name}`,
        emoji: def.emoji || '',
        ownerOnly: false,
        cooldown: def.cooldown === undefined ? 2 : def.cooldown,

        async execute(ctx) {
            const sock = ctx.sock;
            const from = ctx.from;
            const prefix = ctx.prefix || '.';

            const send = (content) => sock.sendMessage(from, content, { quoted: ctx.msg });
            const reply = (text, mentions = []) =>
                send(mentions.length ? { text: String(text), mentions } : { text: String(text) });

            try {
                const isOwner = !!(ctx.isOwner || ctx.isSessionOwner || ctx.isBotOwner);

                if (def.owner && !isOwner) {
                    return reply('👑 This command is for the *bot owner* only.');
                }

                if (def.groupOnly !== false && !ctx.isGroup) {
                    return reply('❌ This command can only be used in a *group*.');
                }

                /* ---------- group metadata ---------- */
                let meta = null;
                if (ctx.isGroup && def.meta !== false) {
                    meta = await sock.groupMetadata(from);
                }
                const parts = (meta && meta.participants) || [];

                /* ---------- sender admin ---------- */
                const senderNums = [num(ctx.senderJid), num(ctx.senderPhone), num(ctx.msg?.key?.participant)]
                    .filter(Boolean);
                const senderPart = parts.find((p) => senderNums.includes(num(partId(p))));
                const isSenderAdmin = isOwner || isAdminPart(senderPart);

                if (def.admin && !isSenderAdmin) {
                    return reply('👮 This command is for *group admins* only.');
                }

                /* ---------- bot admin ---------- */
                const botNums = [
                    sock.user?.id,
                    sock.user?.lid,
                    sock.authState?.creds?.me?.id,
                    sock.authState?.creds?.me?.lid
                ].filter(Boolean).map(num);
                const botPart = parts.find((p) => botNums.includes(num(partId(p))));
                const botIsAdmin = isAdminPart(botPart);

                if (def.botAdmin && !botIsAdmin) {
                    return reply(
                        '⚠️ Make me a group *admin* first so I can do this.'
                    );
                }

                const args = Array.isArray(ctx.args) ? ctx.args : [];
                const raw = stripCommand(ctx.text, prefix, ctx.command);
                const rest = args.filter((a) => !/^@\d+$/.test(a)).join(' ').trim();

                const info = contextOf(ctx.msg);

                /* ---------- target: mention > reply > number ---------- */
                const resolveTarget = (opts = {}) => {
                    let jid = null;
                    const mentioned = Array.isArray(info.mentionedJid) ? info.mentionedJid : [];
                    if (mentioned.length) jid = mentioned[0];
                    if (!jid && info.quotedMessage && info.participant) jid = info.participant;
                    if (!jid && opts.allowNumber !== false) {
                        for (const a of args) {
                            const digits = String(a).replace(/[^\d]/g, '');
                            if (digits.length >= 7 && digits.length <= 15) {
                                jid = `${digits}@s.whatsapp.net`;
                                break;
                            }
                        }
                    }
                    if (!jid) return null;
                    const part = parts.find((p) => num(partId(p)) === num(jid));
                    return {
                        jid: part ? partId(part) : String(jid).split(':')[0].replace(/^whatsapp:/i, ''),
                        phone: num(jid),
                        part: part || null,
                        isAdmin: isAdminPart(part),
                        isCreator: !!(part && part.admin === 'superadmin'),
                        isBot: botNums.includes(num(jid))
                    };
                };

                /* ---------- per-group settings ---------- */
                const store = async () => {
                    const settings = await Setting.getOrCreate(ctx.sessionId, ctx.userId);
                    if (!settings.metadata) settings.metadata = {};
                    if (!settings.metadata.groups) settings.metadata.groups = {};
                    if (!settings.metadata.groups[from]) settings.metadata.groups[from] = {};
                    return {
                        settings,
                        gs: settings.metadata.groups[from],
                        save: async () => {
                            settings.markModified('metadata');
                            await settings.save();
                        }
                    };
                };

                const mentioned = Array.isArray(info.mentionedJid) ? info.mentionedJid.map(normJid) : [];
                const meJid = normJid(ctx.senderJid || ctx.msg?.key?.participant || '');
                const pool = parts
                    .filter((p) => !botNums.includes(num(partId(p))))
                    .map(partId);

                const api = {
                    ctx, sock, from, prefix, args, raw, rest,
                    mentioned, meJid, senderPart, pool, phoneOf, sleep, normJid,
                    text: args.join(' ').trim(),
                    meta, parts,
                    admins: parts.filter((p) => isAdminPart(p) && !botNums.includes(num(partId(p)))),
                    members: parts.filter((p) => !isAdminPart(p)),
                    send, reply, resolveTarget, store,
                    isSenderAdmin, isOwner, botIsAdmin, botNums,
                    num, partId, isAdminPart, timers,
                    tag: (jid) => `@${num(jid)}`,
                    pick: (list) => list[Math.floor(Math.random() * list.length)]
                };

                return await def.run(api);
            } catch (error) {
                console.error(`[GROUP:${def.name}]`, error && error.message ? error.message : error);
                try {
                    await reply(`❌ ${niceError(error)}`);
                } catch (_) { /* ignore */ }
            }
        }
    };
}

module.exports = defineGroup;
module.exports.defineGroup = defineGroup;
module.exports.num = num;
module.exports.timers = timers;
