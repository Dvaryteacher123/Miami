/**
 * =====================================================
 *  PHONEPHIX BOT - SETTING MODEL
 *  Per-session (per-user-bot) settings
 *  Also supports global settings (sessionId = "global")
 * =====================================================
 */

'use strict';

const { Schema, model } = require('../fileStore');

// =====================================================
//  SETTING SCHEMA
// =====================================================
const SettingSchema = new Schema(
  {
    // ---------- IDENTITY ----------
    // sessionId links to a Session doc. Use "global" for bot-wide defaults.
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },

    // optional owner (null when global)
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },

    // ---------- COMMAND BEHAVIOUR ----------
    prefix: {
      type: String,
      default: '.',
      trim: true,
      maxlength: 3
    },

    // public | private | group
    mode: {
      type: String,
      enum: ['public', 'private', 'group'],
      default: 'public',
      index: true
    },

    // ---------- FEATURES TOGGLES ----------
    autoRead: {
      type: Boolean,
      default: true
    },

    autoTyping: {
      type: Boolean,
      default: false
    },

    autoRecording: {
      type: Boolean,
      default: false
    },

    autoOnline: {
      type: Boolean,
      default: true
    },

    autoRejectCall: {
      type: Boolean,
      default: false
    },

    selfMode: {
      type: Boolean,
      default: false // if true, only owner can use bot
    },

    // ---------- GROUP FEATURES ----------
    welcome: {
      enabled: { type: Boolean, default: false },
      message: {
        type: String,
        default: 'Welcome to the group, @user! 👋'
      }
    },

    goodbye: {
      enabled: { type: Boolean, default: false },
      message: {
        type: String,
        default: 'Goodbye @user, we will miss you! 👋'
      }
    },

    antilink: {
      enabled: { type: Boolean, default: false },
      action: {
        type: String,
        enum: ['delete', 'warn', 'kick'],
        default: 'delete'
      }
    },

    antispam: {
      enabled: { type: Boolean, default: false },
      maxMessages: { type: Number, default: 5 },
      windowSeconds: { type: Number, default: 10 }
    },

    antibadword: {
      enabled: { type: Boolean, default: false },
      words: { type: [String], default: [] }
    },

    // ---------- MESSAGE CUSTOMIZATION ----------
    footer: {
      type: String,
      default: 'Powered by Dvary'
    },

    // ---------- PROTECTION ----------
    publicCommands: {
      type: Boolean,
      default: true // if false, only owner
    },

    // ---------- MUTE / BAN LISTS (per session) ----------
    mutedUsers: {
      type: [String],
      default: []
    },

    bannedUsers: {
      type: [String],
      default: []
    },

    blockedUsers: {
      type: [String],
      default: []
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
SettingSchema.index({ userId: 1 });
SettingSchema.index({ mode: 1 });

// =====================================================
//  STATIC METHODS
// =====================================================

// Get or create settings for a sessionId
SettingSchema.statics.getOrCreate = async function (sessionId, userId = null) {
  const sid = String(sessionId || '').trim();
  if (!sid) throw new Error('sessionId is required');

  let doc = await this.findOne({ sessionId: sid });
  if (doc) return doc;

  doc = await this.create({
    sessionId: sid,
    userId: userId || null
  });

  return doc;
};

// Get global defaults (sessionId = "global")
SettingSchema.statics.getGlobal = async function () {
  return this.getOrCreate('global', null);
};

// Update one setting safely
SettingSchema.statics.updateSetting = async function (sessionId, patch = {}) {
  const sid = String(sessionId || '').trim();
  if (!sid) throw new Error('sessionId is required');

  const doc = await this.findOneAndUpdate(
    { sessionId: sid },
    { $set: patch },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return doc;
};

// Reset settings to defaults (keep sessionId + userId)
SettingSchema.statics.resetSettings = async function (sessionId) {
  const sid = String(sessionId || '').trim();
  if (!sid) throw new Error('sessionId is required');

  const existing = await this.findOne({ sessionId: sid });
  const userId = existing ? existing.userId : null;

  await this.deleteOne({ sessionId: sid });
  return this.getOrCreate(sid, userId);
};

// =====================================================
//  EXPORT
// =====================================================
module.exports = model('Setting', SettingSchema);
