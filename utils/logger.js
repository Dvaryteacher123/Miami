/**
 * =====================================================
 *  UTILS: logger
 *  Colored console logger + optional file logging
 * =====================================================
 */

'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const config = require('../config/config');

// =====================================================
//  LEVELS
// =====================================================
const LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4
};

const LEVEL_COLORS = {
  error: chalk.red,
  warn: chalk.yellow,
  info: chalk.cyan,
  debug: chalk.gray,
  trace: chalk.magenta
};

const LEVEL_TAGS = {
  error: '[ERROR]',
  warn: '[WARN ]',
  info: '[INFO ]',
  debug: '[DEBUG]',
  trace: '[TRACE]'
};

// =====================================================
//  CURRENT LEVEL
// =====================================================
const currentLevel =
  LEVELS[(config.logging?.level || 'info').toLowerCase()] ?? LEVELS.info;

// =====================================================
//  FILE LOG STREAM (optional)
// =====================================================
let fileStream = null;
let fileError = false;

function initFileStream() {
  if (!config.logging?.toFile) return;
  if (fileError) return;

  try {
    const folder = config.logging.folder || path.join(config.paths.temp, 'logs');
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    const filePath = path.join(folder, 'bot.log');
    fileStream = fs.createWriteStream(filePath, { flags: 'a' });

    fileStream.on('error', (err) => {
      fileError = true;
      fileStream = null;
      // avoid infinite loops — just print to stderr
      process.stderr.write(`[Logger] File stream error: ${err.message}\n`);
    });
  } catch (err) {
    fileError = true;
    fileStream = null;
    process.stderr.write(`[Logger] File init failed: ${err.message}\n`);
  }
}

initFileStream();

// =====================================================
//  TIMESTAMP
// =====================================================
function ts() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}

// =====================================================
//  CORE
// =====================================================
function writeToFile(line) {
  if (!fileStream) return;
  try {
    fileStream.write(line + '\n');
  } catch (_) {}
}

function log(level, ...args) {
  const levelNum = LEVELS[level];
  if (levelNum === undefined) return;
  if (levelNum > currentLevel) return;

  const color = LEVEL_COLORS[level] || ((s) => s);
  const tag = LEVEL_TAGS[level] || `[${level.toUpperCase()}]`;

  const parts = args.map((a) => {
    if (a instanceof Error) return a.stack || a.message;
    if (typeof a === 'object') {
      try {
        return JSON.stringify(a, null, 2);
      } catch (_) {
        return String(a);
      }
    }
    return String(a);
  });

  const time = ts();
  const consoleLine = `${chalk.gray(time)} ${color(tag)} ${parts.join(' ')}`;
  // eslint-disable-next-line no-console
  console.log(consoleLine);

  const fileLine = `${time} ${tag} ${parts.join(' ')}`;
  writeToFile(fileLine);
}

// =====================================================
//  PUBLIC API
// =====================================================
const logger = {
  error: (...args) => log('error', ...args),
  warn: (...args) => log('warn', ...args),
  info: (...args) => log('info', ...args),
  debug: (...args) => log('debug', ...args),
  trace: (...args) => log('trace', ...args),

  // convenience
  success: (...args) => {
    const time = ts();
    const line = `${chalk.gray(time)} ${chalk.green('[ OK  ]')} ${args.join(' ')}`;
    // eslint-disable-next-line no-console
    console.log(line);
    writeToFile(`${time} [ OK  ] ${args.join(' ')}`);
  },

  // graceful close
  close: () => {
    return new Promise((resolve) => {
      if (!fileStream) return resolve();
      try {
        fileStream.end(() => resolve());
      } catch (_) {
        resolve();
      }
    });
  }
};

module.exports = logger;
