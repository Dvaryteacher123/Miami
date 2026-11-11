/**
 * =====================================================
 *  PHONEPHIX BOT - FILE STORE
 *  Mini "mongoose-like" ODM that saves to local JSON files.
 *  No MongoDB needed. Data lives in ./data/db/<collection>.json
 *
 *  Supports the subset of Mongoose this project uses:
 *   find / findOne / findById / create / countDocuments / exists
 *   updateOne / updateMany / findOneAndUpdate (upsert, new)
 *   deleteOne / deleteMany
 *   .sort() .limit() .skip() .select() .lean()
 *   $set $inc $setOnInsert $push $pull  |  $or $ne $lte $gte $lt $gt $in $nin
 *   schema defaults, timestamps, virtuals, methods, statics, pre('save')
 * =====================================================
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.resolve(
  process.env.DATA_DIR || path.join(process.cwd(), 'data')
);
const DB_DIR = path.join(DATA_DIR, 'db');

// =====================================================
//  HELPERS
// =====================================================
function newId() {
  return crypto.randomBytes(12).toString('hex');
}

function clone(v) {
  if (v === undefined || v === null) return v;
  if (v instanceof Date) return new Date(v.getTime());
  if (Array.isArray(v)) return v.map(clone);
  if (typeof v === 'object') {
    const out = {};
    for (const k of Object.keys(v)) out[k] = clone(v[k]);
    return out;
  }
  return v;
}

function getPath(obj, p) {
  const parts = String(p).split('.');
  let cur = obj;
  for (const part of parts) {
    if (cur === undefined || cur === null) return undefined;
    cur = cur[part];
  }
  return cur;
}

function setPath(obj, p, value) {
  const parts = String(p).split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (cur[part] === undefined || cur[part] === null || typeof cur[part] !== 'object') {
      cur[part] = {};
    }
    cur = cur[part];
  }
  cur[parts[parts.length - 1]] = value;
}

function norm(v) {
  if (v instanceof Date) return v.getTime();
  return v;
}

function looseEqual(a, b) {
  if (a === b) return true;
  if (a === undefined && b === null) return true;
  if (a === null && b === undefined) return true;
  if (a instanceof Date || b instanceof Date) return norm(a) === norm(b);
  if (a !== null && b !== null && typeof a === 'object' && typeof b === 'object') {
    return String(a) === String(b);
  }
  return String(a) === String(b) && typeof a !== 'object' && typeof b !== 'object';
}

function matchCondition(actual, cond) {
  const isOpObject =
    cond !== null &&
    typeof cond === 'object' &&
    !(cond instanceof Date) &&
    !Array.isArray(cond) &&
    Object.keys(cond).some((k) => k.startsWith('$'));

  if (!isOpObject) {
    if (Array.isArray(actual) && !Array.isArray(cond)) {
      return actual.some((x) => looseEqual(x, cond));
    }
    return looseEqual(actual, cond);
  }

  for (const op of Object.keys(cond)) {
    const val = cond[op];
    switch (op) {
      case '$eq':
        if (!looseEqual(actual, val)) return false;
        break;
      case '$ne':
        if (looseEqual(actual, val)) return false;
        break;
      case '$gt':
        if (!(actual !== null && actual !== undefined && norm(actual) > norm(val))) return false;
        break;
      case '$gte':
        if (!(actual !== null && actual !== undefined && norm(actual) >= norm(val))) return false;
        break;
      case '$lt':
        if (!(actual !== null && actual !== undefined && norm(actual) < norm(val))) return false;
        break;
      case '$lte':
        if (!(actual !== null && actual !== undefined && norm(actual) <= norm(val))) return false;
        break;
      case '$in':
        if (!val.some((x) => (Array.isArray(actual) ? actual.some((a) => looseEqual(a, x)) : looseEqual(actual, x)))) return false;
        break;
      case '$nin':
        if (val.some((x) => (Array.isArray(actual) ? actual.some((a) => looseEqual(a, x)) : looseEqual(actual, x)))) return false;
        break;
      case '$exists':
        if ((actual !== undefined) !== Boolean(val)) return false;
        break;
      default:
        break;
    }
  }
  return true;
}

function matches(doc, filter) {
  if (!filter) return true;
  for (const key of Object.keys(filter)) {
    if (key === '$or') {
      if (!filter.$or.some((f) => matches(doc, f))) return false;
    } else if (key === '$and') {
      if (!filter.$and.every((f) => matches(doc, f))) return false;
    } else if (!matchCondition(getPath(doc, key), filter[key])) {
      return false;
    }
  }
  return true;
}

function applyUpdate(doc, update, isInsert) {
  const hasOps = Object.keys(update || {}).some((k) => k.startsWith('$'));

  if (!hasOps) {
    for (const k of Object.keys(update || {})) setPath(doc, k, clone(update[k]));
    return;
  }

  if (update.$set) {
    for (const k of Object.keys(update.$set)) setPath(doc, k, clone(update.$set[k]));
  }
  if (update.$inc) {
    for (const k of Object.keys(update.$inc)) {
      const cur = Number(getPath(doc, k)) || 0;
      setPath(doc, k, cur + Number(update.$inc[k]));
    }
  }
  if (update.$push) {
    for (const k of Object.keys(update.$push)) {
      const arr = Array.isArray(getPath(doc, k)) ? getPath(doc, k) : [];
      arr.push(clone(update.$push[k]));
      setPath(doc, k, arr);
    }
  }
  if (update.$pull) {
    for (const k of Object.keys(update.$pull)) {
      const arr = Array.isArray(getPath(doc, k)) ? getPath(doc, k) : [];
      const cond = update.$pull[k];
      setPath(doc, k, arr.filter((x) => !matchCondition(x, cond)));
    }
  }
  if (update.$unset) {
    for (const k of Object.keys(update.$unset)) setPath(doc, k, undefined);
  }
  if (isInsert && update.$setOnInsert) {
    for (const k of Object.keys(update.$setOnInsert)) setPath(doc, k, clone(update.$setOnInsert[k]));
  }
}

function compareValues(a, b) {
  const x = norm(a);
  const y = norm(b);
  if (x === y) return 0;
  if (x === undefined || x === null) return -1;
  if (y === undefined || y === null) return 1;
  return x > y ? 1 : -1;
}

// =====================================================
//  SCHEMA (defaults + metadata only)
// =====================================================
class Schema {
  constructor(definition = {}, options = {}) {
    this.definition = definition;
    this.options = options;
    this.methods = {};
    this.statics = {};
    this.virtuals = {};
    this.hooks = { save: [] };
  }

  index() { return this; }

  virtual(name) {
    const self = this;
    return {
      get(fn) {
        self.virtuals[name] = fn;
        return this;
      }
    };
  }

  pre(event, fn) {
    if (event === 'save') this.hooks.save.push(fn);
    return this;
  }
}

Schema.Types = { ObjectId: 'ObjectId', Mixed: 'Mixed' };

function isFieldSpec(v) {
  return v && typeof v === 'object' && !Array.isArray(v) && v.type !== undefined && typeof v.type !== 'object'
    ? true
    : v && typeof v === 'object' && !Array.isArray(v) && v.type !== undefined && (v.type === Schema.Types.Mixed || v.type === Schema.Types.ObjectId || Array.isArray(v.type));
}

function buildDefaults(def) {
  const out = {};
  for (const key of Object.keys(def)) {
    const spec = def[key];

    if (Array.isArray(spec)) {
      out[key] = [];
      continue;
    }

    if (spec && typeof spec === 'object' && isFieldSpec(spec)) {
      if (spec.default !== undefined) {
        out[key] = typeof spec.default === 'function' ? spec.default() : clone(spec.default);
      } else if (Array.isArray(spec.type)) {
        out[key] = [];
      }
      continue;
    }

    if (spec && typeof spec === 'object') {
      out[key] = buildDefaults(spec);
    }
  }
  return out;
}

function collectFieldSpecs(def, prefix = '', out = {}) {
  for (const key of Object.keys(def)) {
    const spec = def[key];
    const full = prefix ? `${prefix}.${key}` : key;
    if (spec && typeof spec === 'object' && !Array.isArray(spec)) {
      if (isFieldSpec(spec)) out[full] = spec;
      else collectFieldSpecs(spec, full, out);
    }
  }
  return out;
}

function mergeDefaults(target, defaults) {
  for (const key of Object.keys(defaults)) {
    if (target[key] === undefined) {
      target[key] = clone(defaults[key]);
    } else if (
      defaults[key] && typeof defaults[key] === 'object' &&
      !Array.isArray(defaults[key]) && !(defaults[key] instanceof Date) &&
      target[key] && typeof target[key] === 'object'
    ) {
      mergeDefaults(target[key], defaults[key]);
    }
  }
}

// =====================================================
//  PERSISTENCE (atomic writes, debounced)
// =====================================================
const collections = new Map();

function ensureDir() {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

class Persistence {
  constructor(name) {
    this.name = name;
    this.file = path.join(DB_DIR, `${name}.json`);
    this.docs = [];
    this.timer = null;
    this.writing = false;
    this.dirty = false;
    this.load();
  }

  load() {
    ensureDir();
    try {
      if (fs.existsSync(this.file)) {
        const raw = fs.readFileSync(this.file, 'utf8');
        const parsed = raw.trim() ? JSON.parse(raw, reviver) : [];
        this.docs = Array.isArray(parsed) ? parsed : [];
      }
    } catch (err) {
      // corrupted file: keep a backup and start clean instead of crashing
      try {
        fs.copyFileSync(this.file, `${this.file}.corrupt-${Date.now()}`);
      } catch (_) {}
      this.docs = [];
    }
  }

  schedule() {
    this.dirty = true;
    if (this.timer) return;
    // Write at most every few seconds. With hundreds of sessions the JSON files
    // are large; writing every 1.5s blocked the event loop and made WhatsApp
    // keep-alives time out.
    this.timer = setTimeout(() => {
      this.timer = null;
      this.flushAsync();
    }, Number(process.env.DB_FLUSH_MS) || 8000);
    if (this.timer.unref) this.timer.unref();
  }

  flushAsync() {
    if (!this.dirty || this.writing) {
      if (this.dirty) this.schedule();
      return;
    }
    this.dirty = false;
    this.writing = true;
    let data;
    try {
      data = JSON.stringify(this.docs, null, 0);
    } catch (err) {
      this.writing = false;
      this.dirty = true;
      return;
    }
    const tmp = `${this.file}.tmp`;
    fs.promises
      .writeFile(tmp, data)
      .then(() => fs.promises.rename(tmp, this.file))
      .catch((err) => {
        this.dirty = true;
        console.error(`[FileStore] Failed to write ${this.name}: ${err.message}`);
      })
      .finally(() => {
        this.writing = false;
        if (this.dirty && !this.timer) this.schedule();
      });
  }

  flushSync() {
    if (!this.dirty) return;
    this.dirty = false;
    try {
      ensureDir();
      const tmp = `${this.file}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(this.docs, null, 0));
      fs.renameSync(tmp, this.file);
    } catch (err) {
      this.dirty = true;
      // eslint-disable-next-line no-console
      console.error(`[FileStore] Failed to write ${this.name}: ${err.message}`);
    }
  }
}

const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
function reviver(_k, v) {
  if (typeof v === 'string' && ISO_RE.test(v)) return new Date(v);
  return v;
}

function getPersistence(name) {
  if (!collections.has(name)) collections.set(name, new Persistence(name));
  return collections.get(name);
}

function flushAll() {
  for (const p of collections.values()) {
    if (p.timer) {
      clearTimeout(p.timer);
      p.timer = null;
    }
    if (p.writing) p.dirty = true; // an async write may be cut off: redo it synchronously
    p.flushSync();
  }
}

process.on('exit', flushAll);
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    flushAll();
  });
}

// =====================================================
//  MODEL FACTORY
// =====================================================
const registry = {};

function model(name, schema) {
  if (registry[name]) return registry[name];

  const store = getPersistence(name.toLowerCase() + 's');
  const defaults = buildDefaults(schema.definition);
  const specs = collectFieldSpecs(schema.definition);
  const hasTimestamps = Boolean(schema.options && schema.options.timestamps);

  const hiddenFields = Object.keys(specs).filter((k) => specs[k].select === false);

  function applySetters(raw) {
    for (const key of Object.keys(specs)) {
      const spec = specs[key];
      let val = getPath(raw, key);
      if (typeof val === 'string') {
        if (spec.lowercase) val = val.toLowerCase();
        if (spec.trim) val = val.trim();
        setPath(raw, key, val);
      }
    }
  }

  function checkRequiredAndUnique(raw, selfId) {
    for (const key of Object.keys(specs)) {
      const spec = specs[key];
      const val = getPath(raw, key);

      if (spec.required && (val === undefined || val === null || val === '')) {
        throw new Error(`${name} validation failed: ${key} is required`);
      }
      if (spec.enum && val !== undefined && val !== null && !spec.enum.includes(val)) {
        throw new Error(`${name} validation failed: ${key} has invalid value "${val}"`);
      }
      if (spec.unique && val !== undefined && val !== null && val !== '') {
        const clash = store.docs.find((d) => d._id !== selfId && looseEqual(getPath(d, key), val));
        if (clash) {
          const err = new Error(`E11000 duplicate key error: ${name}.${key} = ${val}`);
          err.code = 11000;
          throw err;
        }
      }
    }
  }

  // ---------- Document wrapper ----------
  class Document {
    constructor(raw, isNew = true) {
      Object.defineProperty(this, '_isNew', { value: isNew, writable: true, enumerable: false });
      Object.defineProperty(this, '_original', { value: isNew ? {} : clone(raw), writable: true, enumerable: false });
      Object.assign(this, raw);
    }

    isModified(field) {
      return JSON.stringify(getPath(this, field)) !== JSON.stringify(getPath(this._original, field));
    }

    // Mongoose compatibility: whole document is saved on save(), so nothing to track
    markModified() {}

    toObject() {
      const out = {};
      for (const k of Object.keys(this)) out[k] = clone(this[k]);
      return out;
    }

    toJSON() {
      const out = this.toObject();
      for (const h of hiddenFields) delete out[h];
      return out;
    }

    async save() {
      for (const hook of schema.hooks.save) {
        await new Promise((resolve, reject) => {
          try {
            const r = hook.call(this, (err) => (err ? reject(err) : resolve()));
            if (r && typeof r.then === 'function') r.then(resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }

      const raw = this.toObject();
      applySetters(raw);
      checkRequiredAndUnique(raw, raw._id);

      const now = new Date();
      if (hasTimestamps) {
        if (!raw.createdAt) raw.createdAt = now;
        raw.updatedAt = now;
      }

      const idx = store.docs.findIndex((d) => d._id === raw._id);
      if (idx >= 0) store.docs[idx] = raw;
      else store.docs.push(raw);
      store.schedule();

      Object.assign(this, raw);
      this._original = clone(raw);
      this._isNew = false;
      return this;
    }

    async deleteOne() {
      const idx = store.docs.findIndex((d) => d._id === this._id);
      if (idx >= 0) {
        store.docs.splice(idx, 1);
        store.schedule();
      }
      return { deletedCount: idx >= 0 ? 1 : 0 };
    }
  }

  for (const key of Object.keys(schema.methods)) {
    Document.prototype[key] = schema.methods[key];
  }
  for (const key of Object.keys(schema.virtuals)) {
    Object.defineProperty(Document.prototype, key, {
      get: schema.virtuals[key],
      enumerable: false,
      configurable: true
    });
  }

  function hydrate(raw) {
    return new Document(clone(raw), false);
  }

  function leanify(raw, selectSpec) {
    const out = clone(raw);
    // hidden fields (password) are excluded unless explicitly requested
    for (const h of hiddenFields) {
      if (!(selectSpec && selectSpec.includes[h])) delete out[h];
    }
    return out;
  }

  // ---------- Query ----------
  class Query {
    constructor(filter, single, projection) {
      this._filter = filter || {};
      this._single = single;
      this._sort = null;
      this._limit = 0;
      this._skip = 0;
      this._lean = false;
      this._select = { includes: {}, excludes: {}, plusHidden: {} };
      if (projection && typeof projection === 'object') this._applyProjection(projection);
    }

    _applyProjection(p) {
      for (const k of Object.keys(p)) {
        if (p[k]) this._select.includes[k] = true;
        else this._select.excludes[k] = true;
      }
    }

    sort(s) { this._sort = s; return this; }
    limit(n) { this._limit = Number(n) || 0; return this; }
    skip(n) { this._skip = Number(n) || 0; return this; }
    lean() { this._lean = true; return this; }
    exec() { return this.then((v) => v); }

    select(spec) {
      if (typeof spec === 'string') {
        for (const token of spec.split(/\s+/).filter(Boolean)) {
          if (token.startsWith('+')) this._select.plusHidden[token.slice(1)] = true;
          else if (token.startsWith('-')) this._select.excludes[token.slice(1)] = true;
          else this._select.includes[token] = true;
        }
      } else if (spec && typeof spec === 'object') {
        this._applyProjection(spec);
      }
      return this;
    }

    _run() {
      let rows = store.docs.filter((d) => matches(d, this._filter));

      if (this._sort) {
        const keys = Object.keys(this._sort);
        rows = rows.slice().sort((a, b) => {
          for (const k of keys) {
            const dir = this._sort[k] < 0 ? -1 : 1;
            const c = compareValues(getPath(a, k), getPath(b, k));
            if (c !== 0) return c * dir;
          }
          return 0;
        });
      }

      if (this._skip) rows = rows.slice(this._skip);
      if (this._single) rows = rows.slice(0, 1);
      else if (this._limit) rows = rows.slice(0, this._limit);

      const includeKeys = Object.keys(this._select.includes);
      const excludeKeys = Object.keys(this._select.excludes);

      const shape = (d) => {
        let out = clone(d);

        // hide select:false fields unless asked with +field (or explicit include)
        for (const h of hiddenFields) {
          if (!this._select.plusHidden[h] && !this._select.includes[h]) delete out[h];
        }

        if (includeKeys.length) {
          const picked = { _id: out._id };
          for (const k of includeKeys) {
            const v = getPath(out, k);
            if (v !== undefined) setPath(picked, k, v);
          }
          out = picked;
        }
        for (const k of excludeKeys) setPath(out, k, undefined) || delete out[k];

        return this._lean ? out : new Document(out, false);
      };

      const shaped = rows.map(shape);
      return this._single ? (shaped[0] || null) : shaped;
    }

    then(resolve, reject) {
      return Promise.resolve().then(() => this._run()).then(resolve, reject);
    }

    catch(fn) { return this.then(undefined, fn); }
  }

  // ---------- Model class ----------
  class Model extends Document {
    constructor(data = {}) {
      const raw = clone(data);
      mergeDefaults(raw, defaults);
      if (!raw._id) raw._id = newId();
      super(raw, true);
    }

    static get modelName() { return name; }

    static find(filter, projection) { return new Query(filter, false, projection); }
    static findOne(filter, projection) { return new Query(filter, true, projection); }

    static findById(id, projection) {
      if (id === undefined || id === null || id === '') {
        return new Query({ _id: '__none__' }, true, projection);
      }
      return new Query({ _id: String(id) }, true, projection);
    }

    static async create(data) {
      if (Array.isArray(data)) {
        const out = [];
        for (const d of data) out.push(await Model.create(d));
        return out;
      }
      const doc = new Model(data);
      await doc.save();
      return doc;
    }

    static async insertMany(list) {
      return Model.create(list);
    }

    static async countDocuments(filter) {
      return store.docs.filter((d) => matches(d, filter || {})).length;
    }

    static async exists(filter) {
      const d = store.docs.find((x) => matches(x, filter || {}));
      return d ? { _id: d._id } : null;
    }

    static async distinct(field, filter) {
      const set = new Set();
      for (const d of store.docs) if (matches(d, filter || {})) set.add(getPath(d, field));
      return [...set];
    }

    static async updateOne(filter, update, options = {}) {
      const doc = store.docs.find((d) => matches(d, filter));
      if (!doc) {
        if (options.upsert) {
          const created = await Model._upsert(filter, update);
          return { matchedCount: 0, modifiedCount: 0, upsertedCount: 1, upsertedId: created._id };
        }
        return { matchedCount: 0, modifiedCount: 0, upsertedCount: 0 };
      }
      applyUpdate(doc, update, false);
      if (hasTimestamps) doc.updatedAt = new Date();
      store.schedule();
      return { matchedCount: 1, modifiedCount: 1, upsertedCount: 0 };
    }

    static async updateMany(filter, update) {
      let n = 0;
      for (const doc of store.docs) {
        if (!matches(doc, filter)) continue;
        applyUpdate(doc, update, false);
        if (hasTimestamps) doc.updatedAt = new Date();
        n++;
      }
      if (n) store.schedule();
      return { matchedCount: n, modifiedCount: n };
    }

    static async _upsert(filter, update) {
      const base = {};
      for (const k of Object.keys(filter || {})) {
        const v = filter[k];
        const isOp = v && typeof v === 'object' && !(v instanceof Date) && Object.keys(v).some((x) => x.startsWith('$'));
        if (!k.startsWith('$') && !isOp) setPath(base, k, clone(v));
      }
      const doc = new Model(base);
      const raw = doc.toObject();
      applyUpdate(raw, update, true);
      const fresh = new Model(raw);
      await fresh.save();
      return fresh;
    }

    static findOneAndUpdate(filter, update, options = {}) {
      const q = new Query(filter, true);
      const origThen = q.then.bind(q);
      q.then = (resolve, reject) =>
        Promise.resolve()
          .then(async () => {
            const doc = store.docs.find((d) => matches(d, filter));
            let target;
            if (!doc) {
              if (!options.upsert) return null;
              const created = await Model._upsert(filter, update);
              return options.new ? (q._lean ? created.toObject() : created) : null;
            }
            const before = clone(doc);
            applyUpdate(doc, update, false);
            if (hasTimestamps) doc.updatedAt = new Date();
            store.schedule();
            target = options.new ? doc : before;
            return q._lean ? clone(target) : new Document(clone(target), false);
          })
          .then(resolve, reject);
      void origThen;
      return q;
    }

    static async deleteOne(filter) {
      const idx = store.docs.findIndex((d) => matches(d, filter));
      if (idx >= 0) {
        store.docs.splice(idx, 1);
        store.schedule();
      }
      return { deletedCount: idx >= 0 ? 1 : 0 };
    }

    static async deleteMany(filter) {
      const before = store.docs.length;
      store.docs = store.docs.filter((d) => !matches(d, filter || {}));
      const n = before - store.docs.length;
      if (n) store.schedule();
      return { deletedCount: n };
    }

    static async bulkWrite(ops) {
      for (const op of ops || []) {
        if (op.updateOne) await Model.updateOne(op.updateOne.filter, op.updateOne.update, { upsert: op.updateOne.upsert });
        else if (op.deleteOne) await Model.deleteOne(op.deleteOne.filter);
        else if (op.deleteMany) await Model.deleteMany(op.deleteMany.filter);
        else if (op.insertOne) await Model.create(op.insertOne.document);
      }
      return { ok: 1 };
    }
  }

  // statics defined in the schema (e.g. Ban.ban, Setting.getOrCreate)
  for (const key of Object.keys(schema.statics)) {
    Model[key] = schema.statics[key];
  }

  registry[name] = Model;
  return Model;
}

module.exports = {
  Schema,
  model,
  flushAll,
  DATA_DIR,
  DB_DIR,
  models: registry
};
