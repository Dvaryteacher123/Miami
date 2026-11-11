/**
 * =====================================================
 *  PHONEPHIX BOT - BAN MODEL
 *  Tracks banned users per session (multi-user aware)
 *  Also supports global bans (sessionId = "global")
 * =====================================================
 */

'use strict';

const { Schema, model } = require('../fileStore');

// =====================================================
//  BAN SCHEMA
// =====================================================
const BanSchema = new Schema(
  {
    // ---------- IDENTITY ----------
    // sessionId links to a Session doc. Use "global" for bot-wide ban.
    sessionId: {
      type: String,
      required: true,
      index: true,
      trim: true
    },

    // who created this ban (session owner)
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },

    // ---------- BANNED TARGET ----------
    // whatsapp jid of banned user (e.g. 2557xxxxxxx@s.whatsapp.net)
    jid: {
      type: String,
      required: true,
      index: true,
      trim: true
    },

    // phone number without jid suffix (for quick lookup/display)
    phoneNumber: {
      type: String,
      default: '',
      index: true,
      trim: true
    },

    // whatsapp pushName (for display)
    pushName: {
      type: String,
      default: ''
    },

    // ---------- BAN DETAILS ----------
    reason: {
      type: String,
      default: 'No reason provided',
      trim: true,
      maxlength: 500
    },

    // who did the ban (owner jid or command caller jid)
    bannedBy: {
      type: String,
      default: ''
    },

    // type of ban
    type: {
      type: String,
      enum: ['ban', 'mute', 'block'],
      default: 'ban',
      index: true
    },

    // ---------- STATUS ----------
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },

    // optional expiry (null = permanent)
    expiresAt: {
      type: Date,
      default: null,
      index: true
    },

    // ---------- COUNTS ----------
    violationCount: {
      type: Number,
      default: 1,
      min: 1
    },

    // ---------- META ----------
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
// one ban per (sessionId + jid + type) — avoid duplicates
BanSchema.index({ sessionId: 1, jid: 1, type: 1 }, { unique: true });
BanSchema.index({ sessionId: 1, isActive: 1 });
BanSchema.index({ phoneNumber: 1, isActive: 1 });
BanSchema.index({ expiresAt: 1 }, { sparse: true });

// =====================================================
//  VIRTUALS
// =====================================================
BanSchema.virtual('isExpired').get(function () {
  if (!this.expiresAt) return false;
  return this.expiresAt.getTime() <= Date.now();
});

BanSchema.virtual('isPermanent').get(function () {
  return this.expiresAt === null;
});

// =====================================================
//  INSTANCE METHODS
// =====================================================
BanSchema.methods.deactivate = function () {
  this.isActive = false;
  return this.save();
};

BanSchema.methods.incrementViolation = function (by = 1) {
  this.violationCount = (this.violationCount || 0) + by;
  return this.save();
};

BanSchema.methods.extend = function (days = 7) {
  const base = this.expiresAt && this.expiresAt.getTime() > Date.now()
    ? this.expiresAt.getTime()
    : Date.now();
  this.expiresAt = new Date(base + days * 24 * 60 * 60 * 1000);
  this.isActive = true;
  return this.save();
};

// =====================================================
//  STATIC METHODS
// =====================================================

// Add or update a ban
BanSchema.statics.ban = async function ({
  sessionId,
  userId = null,
  jid,
  phoneNumber = '',
  pushName = '',
  reason = 'No reason provided',
  bannedBy = '',
  type = 'ban',
  expiresAt = null,
  metadata = {}
}) {
  if (!sessionId) throw new Error('sessionId is required');
  if (!jid) throw new Error('jid is required');

  const filter = {
    sessionId: String(sessionId).trim(),
    jid: String(jid).trim(),
    type
  };

  const update = {
    $set: {
      userId: userId || null,
      phoneNumber: String(phoneNumber || '').trim(),
      pushName: String(pushName || ''),
      reason: String(reason || 'No reason provided'),
      bannedBy: String(bannedBy || ''),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive: true,
      metadata
    },
    $inc: { violationCount: 0 },
    $setOnInsert: {
      createdAt: new Date()
    }
  };

  const doc = await this.findOneAndUpdate(filter, update, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true
  });

  return doc;
};

// Remove a ban (soft delete)
BanSchema.statics.unban = async function (sessionId, jid, type = 'ban') {
  if (!sessionId) throw new Error('sessionId is required');
  if (!jid) throw new Error('jid is required');

  const doc = await this.findOneAndUpdate(
    {
      sessionId: String(sessionId).trim(),
      jid: String(jid).trim(),
      type,
      isActive: true
    },
    { $set: { isActive: false } },
    { new: true }
  );

  return doc;
};

// Check if a jid is banned in a session
BanSchema.statics.isBanned = async function (sessionId, jid, type = 'ban') {
  if (!sessionId || !jid) return false;

  const doc = await this.findOne({
    sessionId: String(sessionId).trim(),
    jid: String(jid).trim(),
    type,
    isActive: true
  });

  if (!doc) return false;

  // auto-deactivate if expired
  if (doc.expiresAt && doc.expiresAt.getTime() <= Date.now()) {
    doc.isActive = false;
    await doc.save();
    return false;
  }

  return true;
};

// Get ban doc (or null)
BanSchema.statics.getBan = function (sessionId, jid, type = 'ban') {
  return this.findOne({
    sessionId: String(sessionId).trim(),
    jid: String(jid).trim(),
    type,
    isActive: true
  });
};

// List active bans in a session
BanSchema.statics.listActive = function (sessionId, type = null) {
  const q = {
    sessionId: String(sessionId).trim(),
    isActive: true
  };
  if (type) q.type = type;
  return this.find(q).sort({ createdAt: -1 });
};

// Count active bans in a session
BanSchema.statics.countActive = function (sessionId) {
  return this.countDocuments({
    sessionId: String(sessionId).trim(),
    isActive: true
  });
};

// Cleanup expired bans (call from cron/manager)
BanSchema.statics.cleanupExpired = async function () {
  const now = new Date();
  const res = await this.updateMany(
    {
      isActive: true,
      expiresAt: { $ne: null, $lte: now }
    },
    { $set: { isActive: false } }
  );
  return res.modifiedCount || 0;
};

// =====================================================
//  EXPORT
// =====================================================
module.exports = model('Ban', BanSchema);
