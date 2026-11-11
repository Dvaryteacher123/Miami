/**
 * =====================================================
 *  PHONEPHIX BOT - AUTH STORE (LOCAL FILES)
 *  Saves each WhatsApp session's login (creds + keys)
 *  inside ./data/auth/<sessionId>/  -- no MongoDB.
 * =====================================================
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { useMultiFileAuthState } = require('./baileys').get();
const { DATA_DIR } = require('../database/fileStore');

const AUTH_ROOT = path.join(DATA_DIR, 'auth');

function safeId(sessionId) {
  return String(sessionId || '').replace(/[^a-zA-Z0-9_\-]/g, '_');
}

function authDir(sessionId) {
  const id = safeId(sessionId);
  if (!id) throw new Error('sessionId is required');
  return path.join(AUTH_ROOT, id);
}

async function useFileAuthState(sessionId) {
  const dir = authDir(sessionId);
  fs.mkdirSync(dir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(dir);

  return {
    state,
    saveCreds,
    // called on shutdown / socket replace: make sure creds hit the disk
    flush: async () => {
      try {
        await saveCreds();
      } catch (_) {}
    }
  };
}

function removeAuth(sessionId) {
  try {
    fs.rmSync(authDir(sessionId), { recursive: true, force: true });
    return true;
  } catch (_) {
    return false;
  }
}

function hasAuth(sessionId) {
  try {
    return fs.existsSync(path.join(authDir(sessionId), 'creds.json'));
  } catch (_) {
    return false;
  }
}

module.exports = { useFileAuthState, removeAuth, hasAuth, authDir, AUTH_ROOT };
