/**
 * =====================================================
 *  PHONEPHIX BOT - SESSION MODEL
 *  Stores Baileys auth data per user (multi-user)
 *  Each user gets a unique sessionId -> isolated auth
 * =====================================================
 */

'use strict';

const { Schema, model } = require('../fileStore');

// =====================================================
//  SUB-SCHEMA: AUTH CREDS (Baileys)
// =====================================================
const AuthCredsSchema = new Schema(
  {
    // creds.json content (noiseKey, signedIdentityKey, registration, etc.)
    data: { type: Schema.Types.Mixed, default: {} }
  },
  { _id: false, minimize: false }
);

// =====================================================
//  SUB-SCHEMA: AUTH KEYS (pre-keys, sender-keys, app-state)
// =====================================================
const AuthKeySchema = new Schema(
  {
    // key type: 'pre-key' | 'sender-key' | 'app-state-sync-key' | 'session'
    type: { type: String, required: true, index: true },

    // unique key id
    keyId: { type: String, required: true },

    // actual key value
    value: { type: Schema.Types.Mixed, default: {} }
  },
  { _id: false, minimize: false }
);

// =====================================================
//  MAIN SESSION SCHEMA
// =====================================================
const SessionSchema = new Schema(
  {
    // ---------- IDENTITY ----------
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },

    // ---------- OWNER (multi-user) ----------
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    // owner's web login identifier (email/username) — for quick lookups
    ownerTag: {
      type: String,
      default: '',
      index: true,
      lowercase: true,
      trim: true
    },

    // ---------- WHATSAPP IDENTITY ----------
    phoneNumber: {
      type: String,
      default: '',
      index: true
    },

    jid: {
      type: String,
      default: ''
    },

    lid: {
      type: String,
      default: ''
    },

    pushName: {
      type: String,
      default: ''
    },

    // ---------- BAILEYS AUTH DATA ----------
    creds: {
      type: AuthCredsSchema,
      default: () => ({ data: {} })
    },

    keys: {
      type: [AuthKeySchema],
      default: []
    },

    // ---------- CONNECTION STATE ----------
    status: {
      type: String,
      enum: ['pairing', 'connecting', 'connected', 'disconnected', 'logged_out', 'error'],
      default: 'disconnected',
      index: true
    },

    lastError: {
      type: String,
      default: ''
    },

    // ---------- TIMESTAMPS ----------
    lastConnectedAt: {
      type: Date,
      default: null
    },

    lastSeenAt: {
      type: Date,
      default: null
    },

    // ---------- FLAGS ----------
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },

    isPrimary: {
      type: Boolean,
      default: false
    },

    // ---------- STATS ----------
    messagesSent: {
      type: Number,
      default: 0
    },

    messagesReceived: {
      type: Number,
      default: 0
    },

    commandsUsed: {
      type: Number,
      default: 0
    },

    // ---------- META ----------
    deviceInfo: {
      type: Schema.Types.Mixed,
      default: {}
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
    minimize: false,
    versionKey: false
  }
);

// =====================================================
//  INDEXES
// =====================================================
SessionSchema.index({ userId: 1, isActive: 1 });
SessionSchema.index({ phoneNumber: 1, isActive: 1 });
SessionSchema.index({ status: 1, isActive: 1 });
SessionSchema.index({ createdAt: -1 });

// =====================================================
//  VIRTUALS
// =====================================================
SessionSchema.virtual('isOnline').get(function () {
  return this.status === 'connected';
});

SessionSchema.virtual('maskedPhone').get(function () {
  const p = this.phoneNumber || '';
  if (p.length <= 4) return p;
  return p.slice(0, 3) + '****' + p.slice(-3);
});

// =====================================================
//  INSTANCE METHODS
// =====================================================
SessionSchema.methods.markConnected = function (extra = {}) {
  this.status = 'connected';
  this.lastConnectedAt = new Date();
  this.lastSeenAt = new Date();
  this.lastError = '';
  if (extra.jid) this.jid = extra.jid;
  if (extra.lid) this.lid = extra.lid;
  if (extra.pushName) this.pushName = extra.pushName;
  if (extra.phoneNumber) this.phoneNumber = extra.phoneNumber;
  return this.save();
};

SessionSchema.methods.markDisconnected = function (reason = '') {
  this.status = 'disconnected';
  this.lastSeenAt = new Date();
  if (reason) this.lastError = String(reason);
  return this.save();
};

SessionSchema.methods.markError = function (message = '') {
  this.status = 'error';
  this.lastSeenAt = new Date();
  this.lastError = String(message);
  return this.save();
};

SessionSchema.methods.markLoggedOut = function () {
  this.status = 'logged_out';
  this.isActive = false;
  this.lastSeenAt = new Date();
  return this.save();
};

// =====================================================
//  STATIC METHODS
// =====================================================
SessionSchema.statics.findBySessionId = function (sessionId) {
  return this.findOne({ sessionId });
};

SessionSchema.statics.findActiveByUser = function (userId) {
  return this.find({ userId, isActive: true }).sort({ createdAt: -1 });
};

SessionSchema.statics.findByPhone = function (phoneNumber) {
  return this.findOne({ phoneNumber, isActive: true });
};

SessionSchema.statics.countActiveByUser = function (userId) {
  return this.countDocuments({ userId, isActive: true });
};

SessionSchema.statics.listAllActive = function () {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

// =====================================================
//  EXPORT
// =====================================================
module.exports = model('Session', SessionSchema);
