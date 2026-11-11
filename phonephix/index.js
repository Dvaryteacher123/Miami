'use strict';

/**
 * PHONEPHIX BOT - SINGLE COMMAND LOADER
 *
 * Loads every command recursively from commands/ and supports both:
 *   async execute(ctx)
 * and the older:
 *   async run(ctx, { reply, replyError, replySuccess })
 *
 * This keeps old commands working while new commands can use execute().
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const commands = new Map();

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function loadCommandsFromDirectory(directory) {
  if (!fs.existsSync(directory)) return;

  for (const file of fs.readdirSync(directory)) {
    if (file === 'index.js') continue;

    const fullPath = path.join(directory, file);
    let stat;

    try {
      stat = fs.statSync(fullPath);
    } catch (error) {
      logger.error(`[COMMAND STAT ERROR] ${fullPath}: ${error.message}`);
      continue;
    }

    if (stat.isDirectory()) {
      loadCommandsFromDirectory(fullPath);
      continue;
    }

    if (!file.endsWith('.js')) continue;

    try {
      delete require.cache[require.resolve(fullPath)];
      const mod = require(fullPath);
      const commandModule = mod?.default || mod;
      if (!commandModule || typeof commandModule !== 'object') continue;

      const name = normalize(commandModule.name || commandModule.command);
      const execute = commandModule.execute;
      const run = commandModule.run;

      if (!name || (typeof execute !== 'function' && typeof run !== 'function')) {
        logger.warn(`[COMMAND SKIPPED] Invalid command: ${fullPath}`);
        continue;
      }

      const entry = {
        ...commandModule,
        name,
        aliases: Array.isArray(commandModule.aliases)
          ? commandModule.aliases.map(normalize).filter(Boolean)
          : [],
        execute: typeof execute === 'function' ? execute : null,
        run: typeof run === 'function' ? run : null,
        file: fullPath
      };

      commands.set(name, entry);

      for (const alias of entry.aliases) {
        commands.set(alias, { ...entry, name: alias, aliasOf: name });
      }
    } catch (error) {
      logger.error(`[COMMAND LOAD ERROR] ${fullPath}: ${error.message}`);
    }
  }
}

function loadCommands() {
  commands.clear();
  loadCommandsFromDirectory(path.join(__dirname));
  logger.info(`[COMMANDS] Loaded ${getUniqueCommands().length} command(s)`);
  return getCommands();
}

function getCommand(name) {
  return commands.get(normalize(name)) || null;
}

function getUniqueCommands() {
  const seen = new Set();
  const result = [];
  for (const command of commands.values()) {
    const canonical = command.aliasOf || command.name;
    if (seen.has(canonical)) continue;
    seen.add(canonical);
    result.push(command);
  }
  return result;
}

function getCommands() {
  return getUniqueCommands();
}

function hasCommand(name) {
  return Boolean(getCommand(name));
}

function makeReplyHelpers(ctx) {
  const reply = async (text, options = {}) => {
    if (!ctx?.sock || !ctx?.from) return false;
    await ctx.sock.sendMessage(
      ctx.from,
      { text: String(text) },
      { quoted: options.quoted !== undefined ? options.quoted : ctx.msg }
    );
    return true;
  };

  const replyError = (text) => reply(`❌ ${String(text).replace(/^❌\s*/, '')}`);
  const replySuccess = (text) => reply(`✅ ${String(text).replace(/^✅\s*/, '')}`);

  return { reply, replyError, replySuccess };
}

async function runCommand(ctx) {
  const command = getCommand(ctx?.command);
  if (!command) return false;

  try {
    const helpers = makeReplyHelpers(ctx);

    // React to the command message with an emoji (fire-and-forget, never blocks)
    if (String(process.env.COMMAND_REACT || 'true').toLowerCase() !== 'false' && ctx.sock && ctx.msg && ctx.msg.key) {
      try {
        const emoji = require('../utils/cmdEmoji').emojiFor(command);
        Promise.resolve(ctx.sock.sendMessage(ctx.from, { react: { text: emoji, key: ctx.msg.key } })).catch(() => {});
      } catch (_) {}
    }

    if (typeof command.execute === 'function') {
      await command.execute({ ...ctx, ...helpers, getCommands });
    } else {
      await command.run({ ...ctx, ...helpers, getCommands }, helpers);
    }

    return true;
  } catch (error) {
    logger.error(`[COMMAND ERROR] ${ctx?.command}: ${error.message}`);
    try {
      await makeReplyHelpers(ctx).replyError(`Command Error\n\n${error.message}`);
    } catch (_) {}
    return true;
  }
}

function reloadCommands() {
  return loadCommands();
}

// Initial load.
loadCommands();

module.exports = {
  commands,
  loadCommands,
  getCommands,
  getCommand,
  hasCommand,
  runCommand,
  reloadCommands
};
