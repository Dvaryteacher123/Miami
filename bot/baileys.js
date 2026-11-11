/**
 * =====================================================
 *  PHONEPHIX BOT - BAILEYS LOADER
 *  Works whether @whiskeysockets/baileys is CommonJS or
 *  ESM-only (fixes ERR_REQUIRE_ESM).
 *
 *  - server.js calls `await load()` once at boot
 *  - everywhere else use:  require('./baileys').get()
 * =====================================================
 */

'use strict';

const PKG = '@whiskeysockets/baileys';
let cached = null;

function isEsmError(e) {
  return !!e && (
    e.code === 'ERR_REQUIRE_ESM' ||
    /ES Module|require\(\) of ES/i.test(String(e.message || ''))
  );
}

async function load() {
  if (cached) return cached;
  try {
    cached = require(PKG);
  } catch (e) {
    if (!isEsmError(e)) throw e;
    cached = await import(PKG);
  }
  return cached;
}

function get() {
  if (cached) return cached;
  try {
    cached = require(PKG); // works for CJS builds / Node 22+
    return cached;
  } catch (e) {
    if (isEsmError(e)) {
      throw new Error(
        'Baileys is ESM-only and not loaded yet. ' +
        'Make sure server.js awaits require("./bot/baileys").load() first.'
      );
    }
    throw e;
  }
}

module.exports = { load, get };
