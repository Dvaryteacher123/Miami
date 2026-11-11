/**
 * =====================================================
 *  PHONEPHIX BOT - USER MODEL
 *  Web panel users (each owns 1..N WhatsApp sessions)
 * =====================================================
 */

'use strict';

const bcrypt = require('bcryptjs');
const { Schema, model } = require('../fileStore');

// =====================================================
//  USER SCHEMA
// =====================================================
const UserSchema = new Schema(
  {
    // ---------- IDENTITY ----------
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 32
    },

    email: {
      type: String,
      default: '',
      lowercase: true,
      trim: true,
      index: true,
      sparse: true
    },

    password: {
      type: String,
      required: true,
      select: false // do not return by default
    },

    // ---------- PROFILE ----------
    displayName: {
      type: String,
      default: '',
      trim: true,
      maxlength: 64
    },

    avatar: {
      type: String,
      default: ''
    },

    // ---------- ROLE / ACCESS ----------
    role: {
      type: String,
      enum: ['user', 'premium', 'admin', 'owner'],
      default: 'user',
      index: true
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    // ---------- SESSION LIMITS ----------
    // overrides config.multiUser.maxSessionsPerUser when > 0
    maxSessions: {
      type: Number,
      default: 0,
      min: 0
    },

    // ---------- LAST LOGIN ----------
    lastLoginAt: {
      type: Date,
      default: null
    },

    lastLoginIp: {
      type: String,
      default: ''
    },

    // ---------- TOKENS ----------
    apiToken: {
      type: String,
      default: '',
      index: true,
      sparse: true
    },

    resetToken: {
      type: String,
      default: ''
    },

    resetTokenExpires: {
      type: Date,
      default: null
    },

    // ---------- STATS ----------
    totalSessions: {
      type: Number,
      default: 0
    },

    totalCommands: {
      type: Number,
      default: 0
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
UserSchema.index({ createdAt: -1 });
UserSchema.index({ role: 1, isActive: 1 });

// =====================================================
//  VIRTUALS
// =====================================================
UserSchema.virtual('isAdmin').get(function () {
  return this.role === 'admin' || this.role === 'owner';
});

UserSchema.virtual('isOwner').get(function () {
  return this.role === 'owner';
});

UserSchema.virtual('isPremium').get(function () {
  return this.role === 'premium' || this.isAdmin;
});

// =====================================================
//  PRE-SAVE: HASH PASSWORD
// =====================================================
UserSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next();

    // if already hashed (starts with $2a$ / $2b$ / $2y$), skip
    if (/^\$2[aby]\$/.test(this.password)) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// =====================================================
//  INSTANCE METHODS
// =====================================================
UserSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

UserSchema.methods.setPassword = async function (plain) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(plain, salt);
  return this.save();
};

UserSchema.methods.markLogin = function (ip = '') {
  this.lastLoginAt = new Date();
  this.lastLoginIp = String(ip || '');
  return this.save();
};

UserSchema.methods.incrementSessions = function (by = 1) {
  this.totalSessions = (this.totalSessions || 0) + by;
  if (this.totalSessions < 0) this.totalSessions = 0;
  return this.save();
};

UserSchema.methods.incrementCommands = function (by = 1) {
  this.totalCommands = (this.totalCommands || 0) + by;
  return this.save();
};

UserSchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    displayName: this.displayName,
    avatar: this.avatar,
    role: this.role,
    isActive: this.isActive,
    isVerified: this.isVerified,
    maxSessions: this.maxSessions,
    lastLoginAt: this.lastLoginAt,
    totalSessions: this.totalSessions,
    totalCommands: this.totalCommands,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// =====================================================
//  STATIC METHODS
// =====================================================
UserSchema.statics.findByUsername = function (username) {
  return this.findOne({ username: String(username || '').toLowerCase().trim() });
};

UserSchema.statics.findByEmail = function (email) {
  if (!email) return null;
  return this.findOne({ email: String(email).toLowerCase().trim() });
};

UserSchema.statics.findByLogin = function (login) {
  const v = String(login || '').toLowerCase().trim();
  if (!v) return null;
  return this.findOne({ $or: [{ username: v }, { email: v }] });
};

UserSchema.statics.findByApiToken = function (token) {
  if (!token) return null;
  return this.findOne({ apiToken: token, isActive: true });
};

UserSchema.statics.existsByUsername = function (username) {
  return this.exists({ username: String(username || '').toLowerCase().trim() });
};

// =====================================================
//  ENSURE OWNER USER EXISTS (bootstrap)
//  Called from BotManager.init()
// =====================================================
UserSchema.statics.ensureOwner = async function (username, password) {
  if (!username || !password) return null;

  const uname = String(username).toLowerCase().trim();
  let user = await this.findOne({ username: uname });

  if (user) {
    if (user.role !== 'owner') {
      user.role = 'owner';
      await user.save();
    }
    return user;
  }

  user = await this.create({
    username: uname,
    password,
    displayName: 'Owner',
    role: 'owner',
    isActive: true,
    isVerified: true
  });

  return user;
};

// =====================================================
//  EXPORT
// =====================================================
module.exports = model('User', UserSchema);
