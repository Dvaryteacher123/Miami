/**
 * =====================================================
 *  PHONEPHIX BOT - CENTRAL CONFIGURATION
 *  Reads from .env and exposes structured config object
 * =====================================================
 */

'use strict';

const path = require('path');
require('dotenv').config();

// ---------- HELPERS ----------
const toBool = (v, def = false) => {
  if (v === undefined || v === null || v === '') return def;
  return ['true', '1', 'yes', 'on'].includes(String(v).toLowerCase());
};

const toInt = (v, def = 0) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : def;
};

const toStr = (v, def = '') => (v === undefined || v === null ? def : String(v));

const ROOT = path.resolve(__dirname, '..');

// =====================================================
//  CONFIG OBJECT
// =====================================================
const config = {
  // ---------- ENV ----------
  env: toStr(process.env.NODE_ENV, 'development'),
  isDev: toStr(process.env.NODE_ENV, 'development') === 'development',
  isProd: toStr(process.env.NODE_ENV, 'development') === 'production',

  // ---------- SERVER ----------
  port: toInt(process.env.PORT, 3000),
  host: toStr(process.env.HOST, '0.0.0.0'),
  baseUrl: toStr(process.env.BASE_URL, `http://localhost:${toInt(process.env.PORT, 3000)}`),

  // ---------- SESSION / SECURITY ----------
  session: {
    secret: toStr(process.env.SESSION_SECRET, 'phonephix_fallback_secret_change_me'),
    maxAge: toInt(process.env.COOKIE_MAX_AGE, 86400000),
    jwtSecret: toStr(process.env.JWT_SECRET, 'phonephix_jwt_fallback_change_me')
  },

  // ---------- MONGODB ----------
  mongo: {
    // Accepts MONGO_URI first; falls back to DATABASE_URL (the name some
    // hosts like Render/Railway use by default) before finally falling
    // back to a local MongoDB instance.
    uri: toStr(
      process.env.MONGO_URI || process.env.DATABASE_URL,
      'mongodb://127.0.0.1:27017/phonephix_bot'
    ),
    dbName: toStr(process.env.MONGO_DB_NAME, 'phonephix_bot'),
    sessionCollection: toStr(process.env.MONGO_SESSION_COLLECTION, 'sessions'),
    options: {
      // mongoose 8 defaults are fine; kept for clarity
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 50
    }
  },

  // ---------- BOT ----------
  bot: {
    name: toStr(process.env.BOT_NAME, 'Phonephix Bot'),
    version: toStr(process.env.BOT_VERSION, '1.0.0'),
    owner: toStr(process.env.BOT_OWNER, 'Dvary'),
    ownerNumber: toStr(process.env.OWNER_NUMBER, '').replace(/[^\d]/g, ''),
    defaultPrefix: toStr(process.env.DEFAULT_PREFIX, '.'),
    mode: toStr(process.env.BOT_MODE, 'public').toLowerCase(), // public | private | group
    footer: toStr(process.env.BOT_FOOTER, 'Powered by Dvary'),
    timezone: toStr(process.env.BOT_TIMEZONE, 'Africa/Dar_es_Salaam')
  },

  // ---------- BAILEYS / WHATSAPP ----------
  baileys: {
    pairCodeTimeout: toInt(process.env.WA_PAIR_CODE_TIMEOUT, 60000),
    reconnectInterval: toInt(process.env.WA_RECONNECT_INTERVAL, 5000),
    maxReconnect: toInt(process.env.WA_MAX_RECONNECT, 10),
    printQR: toBool(process.env.WA_PRINT_QR, true),
    browser: [
      toStr(process.env.WA_BROWSER, 'Ubuntu'),
      'Chrome',
      toStr(process.env.WA_BROWSER_VERSION, '22.04.4')
    ],
    authFolder: toStr(process.env.WA_AUTH_FOLDER, './temp/auth'),
    markOnline: toBool(process.env.WA_MARK_ONLINE, true),
    readMessages: toBool(process.env.WA_READ_MESSAGES, true),
    autoReconnect: toBool(process.env.WA_AUTO_RECONNECT, true)
  },

  // ---------- MULTI-USER ----------
  // Single-user build: .env values for these are deliberately ignored.
  multiUser: {
    enabled: true,
    maxSessionsPerUser: 1,
    autoCleanup: toBool(process.env.SESSION_AUTO_CLEANUP, true),
    cleanupInterval: toInt(process.env.SESSION_CLEANUP_INTERVAL, 3600000)
  },

  // ---------- WEB PANEL ----------
  web: {
    enabled: toBool(process.env.WEB_PANEL_ENABLED, true),
    title: toStr(process.env.WEB_TITLE, 'Phonephix Bot Panel'),
    description: 'Phonephix single-user WhatsApp bot',
    theme: toStr(process.env.WEB_THEME, 'dark')
  },

  // ---------- RATE LIMIT ----------
  rateLimit: {
    windowMs: toInt(process.env.RATE_LIMIT_WINDOW, 15 * 60 * 1000),
    max: toInt(process.env.RATE_LIMIT_MAX, 100),
    pairMax: toInt(process.env.PAIR_RATE_LIMIT_MAX, 5)
  },

  // ---------- LOGGING ----------
  logging: {
    level: toStr(process.env.LOG_LEVEL, 'info'),
    toFile: toBool(process.env.LOG_TO_FILE, true),
    folder: toStr(process.env.LOG_FOLDER, './temp/logs')
  },

  // ---------- UPLOADS / TEMP ----------
  uploads: {
    folder: toStr(process.env.UPLOAD_FOLDER, './temp'),
    maxFileSize: toInt(process.env.MAX_FILE_SIZE, 52428800),
    tempCleanup: toBool(process.env.TEMP_CLEANUP, true)
  },

  // ---------- API KEYS ----------
  apiKeys: {
    openai: toStr(process.env.OPENAI_API_KEY, ''),
    weather: toStr(process.env.WEATHER_API_KEY, ''),
    news: toStr(process.env.NEWS_API_KEY, '')
  },

  // ---------- PATHS (absolute) ----------
  paths: {
    root: ROOT,
    config: path.join(ROOT, 'config'),
    database: path.join(ROOT, 'database'),
    models: path.join(ROOT, 'database', 'models'),
    bot: path.join(ROOT, 'bot'),
    commands: path.join(ROOT, 'phonephix'),
    routes: path.join(ROOT, 'routes'),
    controllers: path.join(ROOT, 'controllers'),
    middleware: path.join(ROOT, 'middleware'),
    utils: path.join(ROOT, 'utils'),
    views: path.join(ROOT, 'views'),
    public: path.join(ROOT, 'public'),
    temp: path.join(ROOT, 'temp'),
    uploads: path.join(ROOT, 'public', 'uploads')
  }
};

// =====================================================
//  FREEZE (avoid accidental mutation)
// =====================================================
Object.freeze(config.paths);
Object.freeze(config.bot);
Object.freeze(config.multiUser);
Object.freeze(config.mongo.options);

module.exports = config;
