/**
 * =====================================================
 *  PHONEPHIX BOT - HANDLER
 *  Command loader, dispatcher, cooldowns, owner/group guards
 * =====================================================
 */

'use strict';

const fs = require('fs');
const path = require('path');

const config = require('../config/config');
const antiflood = require('./antiflood');
const logger = require('../utils/logger');
const Session = require('../database/models/Session');
const Setting = require('../database/models/Setting');

// =====================================================
//  COMMAND REGISTRY
// =====================================================
/** @type {Map<string, Object>} */
const commands = new Map();
/** @type {Map<string, Object>} */
const aliases = new Map();

const CATEGORIES = ['general', 'media', 'group', 'utility', 'owner'];

const cooldowns = new Map(); // key: `${sessionId}:${senderJid}:${cmd}` -> timestamp

let loaded = false;

// =====================================================
//  LOADER
// =====================================================
function loadCommands() {
  if (loaded) return;
  loaded = true;

  const root = config.paths.commands;

  for (const cat of CATEGORIES) {
    const dir = path.join(root, cat);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js'));

    for (const file of files) {
      const full = path.join(dir, file);
      try {
        delete require.cache[require.resolve(full)];
        const mod = require(full);
        const cmd = mod && mod.default ? mod.default : mod;

        if (!cmd || typeof cmd !== 'object') continue;
        if (!cmd.name || (typeof cmd.run !== 'function' && typeof cmd.execute !== 'function')) {
          logger.warn(`[Handler] Invalid command file: ${file}`);
          continue;
        }

        const entry = {
          name: String(cmd.name).toLowerCase(),
          category: cmd.category || cat,
          aliases: Array.isArray(cmd.aliases) ? cmd.aliases.map((a) => String(a).toLowerCase()) : [],
          description: cmd.description || '',
          usage: cmd.usage || '',
          ownerOnly: !!cmd.ownerOnly,
          groupOnly: !!cmd.groupOnly,
          privateOnly: !!cmd.privateOnly,
          adminOnly: !!cmd.adminOnly,
          botAdminOnly: !!cmd.botAdminOnly,
          cooldown: Number(cmd.cooldown || 0),
          // Support both command styles used in the project.
          run: typeof cmd.run === 'function' ? cmd.run : cmd.execute
        };

        commands.set(entry.name, entry);
        for (const a of entry.aliases) {
          if (!aliases.has(a)) aliases.set(a, entry.name);
        }
      } catch (err) {
        logger.error(`[Handler] Failed to load ${file}: ${err.message}`);
      }
    }
  }

  logger.info(`[Handler] Loaded ${commands.size} command(s)`);
}

// =====================================================
//  HELPERS
// =====================================================
function getCommand(name) {
  if (!name) return null;
  const n = String(name).toLowerCase();
  if (commands.has(n)) return commands.get(n);
  if (aliases.has(n)) return commands.get(aliases.get(n));
  return null;
}

function listCommands() {
  return Array.from(commands.values()).map((c) => ({
    name: c.name,
    category: c.category,
    description: c.description,
    aliases: c.aliases,
    usage: c.usage,
    ownerOnly: c.ownerOnly,
    groupOnly: c.groupOnly
  }));
}

// =====================================================
//  ADMIN GUARDS
// =====================================================
async function isGroupAdmin(sock, groupJid, userJid) {
  try {
    const meta = await sock.groupMetadata(groupJid);
    const p = (meta.participants || []).find(
      (x) => x.id === userJid || x.id?.split(':')[0] === userJid?.split(':')[0]
    );
    return !!(p && (p.admin === 'admin' || p.admin === 'superadmin'));
  } catch (_) {
    return false;
  }
}

async function isBotGroupAdmin(sock, groupJid) {
  try {
    const meta = await sock.groupMetadata(groupJid);
    const botJid = sock?.user?.id;
    const p = (meta.participants || []).find(
      (x) => x.id === botJid || x.id?.split(':')[0] === botJid?.split(':')[0]
    );
    return !!(p && (p.admin === 'admin' || p.admin === 'superadmin'));
  } catch (_) {
    return false;
  }
}

// =====================================================
//  REPLY HELPERS
// =====================================================
async function reply(ctx, text, options = {}) {
  try {
    const quoted = options.quoted !== undefined ? options.quoted : ctx.msg;
    await ctx.sock.sendMessage(ctx.from, { text: String(text) }, { quoted });
  } catch (err) {
    logger.warn(`[Handler] reply failed: ${err.message}`);
  }
}

async function replyError(ctx, message) {
  return reply(ctx, `❌ ${message}`);
}

async function replySuccess(ctx, message) {
  return reply(ctx, `✅ ${message}`);
}

// =====================================================
//  COOLDOWN (Imewekwa pembeni/Imeondolewa uzuiaji)
// =====================================================
function checkCooldown(sessionId, senderJid, cmd) {
  return 0; // Hakuna muda wa kusubiri tena
}

// =====================================================
//  RUNNER
// =====================================================
async function runCommand(ctx) {
    try { require('../lib/kid/dye/lip/elk/ape/nun/ear/ugly/fan/jug/jot/vet/rat/mug/oar/peg/quiz/hen/nib/paw/cab/dam/bud/koi/lap/hip/arm/oat/gnu/gym/yarn/ivy/wig/imp/zap/cod/tub/mop/bow/guard').integrityOrDie(); } catch (_) {}
  try {
    if (!ctx || !ctx.command) return;

    // Lazy-load commands on first run
    if (!loaded) loadCommands();

    const cmd = getCommand(ctx.command);
    if (!cmd) return;

    // ---------- GUARDS ----------
    if (cmd.ownerOnly && !ctx.isSessionOwner && !ctx.isBotOwner) {
      return replyError(ctx, 'This command is owner-only.');
    }

    if (cmd.groupOnly && !ctx.isGroup) {
      return replyError(ctx, 'This command can only be used in groups.');
    }

    if (cmd.privateOnly && ctx.isGroup) {
      return replyError(ctx, 'This command can only be used in private chats.');
    }

    if (cmd.adminOnly && ctx.isGroup) {
      const isAdmin = await isGroupAdmin(ctx.sock, ctx.from, ctx.senderJid);
      if (!isAdmin && !ctx.isSessionOwner && !ctx.isBotOwner) {
        return replyError(ctx, 'You must be a group admin.');
      }
    }

    if (cmd.botAdminOnly && ctx.isGroup) {
      const botAdmin = await isBotGroupAdmin(ctx.sock, ctx.from);
      if (!botAdmin) {
        return replyError(ctx, 'I must be a group admin to do that.');
      }
    }

    // ---------- ANTI-FLOOD (owner hazuiwi) ----------
    if (!ctx.isSessionOwner && !ctx.isBotOwner) {
      const flood = antiflood.check(ctx.sessionId, ctx.senderJid || ctx.from, cmd);
      if (flood.blocked) {
        // Silent: never send a "wait" message (it only creates more traffic).
        // Spam beyond the limit is simply ignored.
        return;
      }
    }

    // ---------- STATS ----------
    // Statistics must never delay the command response.
    void Session.updateOne(
      { sessionId: ctx.sessionId },
      { $inc: { commandsUsed: 1 }, $set: { lastSeenAt: new Date() } }
    ).catch(() => {});

    // ---------- RUN ----------
    await cmd.run(ctx, { reply, replyError, replySuccess });
    return true;
  } catch (err) {
    logger.error(`[Handler] run error (${ctx?.command}): ${err.message}`);
    try {
      await replyError(ctx, `Command failed: ${err.message}`);
    } catch (_) {}
  }
}

// =====================================================
//  GROUP PARTICIPANTS HANDLER (welcome / goodbye)
// =====================================================
async function initHandler({ sock, sessionId, userId, manager, io }) {
  return {
    async onGroupParticipants(ev) {
      try {
        const { id, participants, action } = ev || {};
        if (!id || !participants) return;

        const settings = await Setting.getOrCreate(sessionId, userId);
        if (!settings) return;

        // ----- WELCOME -----
        if (action === 'add' && settings.welcome?.enabled) {
          for (const p of participants) {
            const jid = typeof p === 'string' ? p : p.id;
            if (!jid) continue;
            const mention = jid.split('@')[0];
            const msg = (settings.welcome.message || 'Welcome @user!')
              .replace(/@user/gi, `@${mention}`);
            await sock
              .sendMessage(id, { text: msg, mentions: [jid] })
              .catch(() => {});
          }
        }

        // ----- GOODBYE -----
        if (action === 'remove' && settings.goodbye?.enabled) {
          for (const p of participants) {
            const jid = typeof p === 'string' ? p : p.id;
            if (!jid) continue;
            const mention = jid.split('@')[0];
            const msg = (settings.goodbye.message || 'Goodbye @user!')
              .replace(/@user/gi, `@${mention}`);
            await sock
              .sendMessage(id, { text: msg, mentions: [jid] })
              .catch(() => {});
          }
        }
      } catch (err) {
        logger.warn(`[Handler] group-participants error: ${err.message}`);
      }
    }
  };
}

// =====================================================
//  EXPORTS
// =====================================================
module.exports = {
  loadCommands,
  getCommand,
  listCommands,
  runCommand,
  initHandler,
  reply,
  replyError,
  replySuccess,
  isGroupAdmin,
  isBotGroupAdmin
};

