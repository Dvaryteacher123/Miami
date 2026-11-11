/**
 * =====================================================
 *  PHONEPHIX BOT - DATABASE (LOCAL FILES)
 *  No MongoDB. Everything is stored as JSON files in ./data
 *   - data/db/*.json     users, sessions info, settings, bans
 *   - data/auth/<id>/    WhatsApp auth (creds + keys) per session
 *   - data/web-sessions/ website login sessions
 * =====================================================
 */

'use strict';

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const fileStore = require('./fileStore');

let connected = false;

async function connect() {
  if (connected) return true;

  fs.mkdirSync(fileStore.DB_DIR, { recursive: true });
  fs.mkdirSync(path.join(fileStore.DATA_DIR, 'auth'), { recursive: true });
  fs.mkdirSync(path.join(fileStore.DATA_DIR, 'web-sessions'), { recursive: true });

  // touch every model so their files are loaded into memory now
  require('./models/User');
  require('./models/Session');
  require('./models/Setting');
  require('./models/Ban');

  connected = true;
  logger.info(`[Database] Local file storage ready at ${fileStore.DATA_DIR}`);
  return true;
}

async function disconnect() {
  fileStore.flushAll();
  connected = false;
  logger.info('[Database] Data flushed to disk');
}

function isReady() {
  return connected;
}

function getState() {
  return connected ? 'connected' : 'disconnected';
}

async function dropDatabase() {
  for (const name of Object.keys(fileStore.models)) {
    await fileStore.models[name].deleteMany({});
  }
  fileStore.flushAll();
  logger.warn('[Database] All local data cleared');
}

module.exports = {
  connect,
  disconnect,
  isReady,
  getState,
  dropDatabase,
  fileStore,
  get connection() {
    return { readyState: connected ? 1 : 0 };
  }
};
