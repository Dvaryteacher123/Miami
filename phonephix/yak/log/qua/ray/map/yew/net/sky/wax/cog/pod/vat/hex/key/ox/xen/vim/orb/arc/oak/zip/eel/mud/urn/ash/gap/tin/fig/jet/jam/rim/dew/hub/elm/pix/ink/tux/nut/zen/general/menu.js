'use strict';

/**
 * =====================================================
 *  MENU  (Phonephix Bot)
 *  .menu              -> full menu, every category in one box layout
 *  .menu <category>   -> just one category
 *  Built once and cached. Every command gets a flower.
 * =====================================================
 */

const path = require('path');
const fs = require('fs');

const WITH_IMAGE = String(process.env.MENU_WITH_IMAGE || 'false').toLowerCase() === 'true';
const BUSY_QUEUE = Number(process.env.MENU_BUSY_QUEUE) || 8;
// WhatsApp accepts ~65,000 characters in one text message, so the whole menu goes out as ONE message
const MAX_TEXT = Number(process.env.MENU_TEXT_MAX) || 60000;

let CONF = {};
try { CONF = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../config/config').bot || {}; } catch (_) {}
const OWNER_NAME = CONF.owner || process.env.BOT_OWNER || 'Dvary';
const TIMEZONE = CONF.timezone || 'Africa/Dar_es_Salaam';
const VERSION = process.env.BRAND_VERSION || ('v' + (CONF.version || '1.0.0').replace(/^v/i, ''));

const LOADING_TEXT = process.env.MENU_LOADING_TEXT || '🌸 Phonephix loading....';

const FLOWERS = ['🌸', '🌺', '🌼', '🌷', '🌹', '💐', '🪷', '🏵️'];

const CATEGORY_TITLES = {
    owner: '👑 OWNER',
    general: '💻 BOT',
    group: '👥 GROUP',
    ai: '🤖 AI',
    media: '📥 MEDIA',
    utility: '🛠️ TOOLS',
    fun: '🎯 FUN',
    custom: '🌟 CUSTOM',
    other: '✨ OTHER'
};

const CATEGORY_ORDER = ['owner', 'general', 'group', 'ai', 'media', 'utility', 'fun', 'custom', 'other'];

let cache = null;
const imageCache = new Map();

function buildCache(commands) {
    const groups = {};
    const seen = new Set();

    for (const command of commands) {
        if (!command || !command.name) continue;
        const name = String(command.name).toLowerCase();
        if (seen.has(name)) continue;
        seen.add(name);
        const category = String(command.category || 'other').toLowerCase();
        (groups[category] = groups[category] || []).push(name);
    }

    const order = [
        ...CATEGORY_ORDER,
        ...Object.keys(groups).filter((c) => !CATEGORY_ORDER.includes(c))
    ];

    const byCategory = {};
    const blocks = [];
    let flower = 0;

    for (const category of order) {
        const list = groups[category];
        if (!list || !list.length) continue;
        list.sort((a, b) => a.localeCompare(b));

        const title = CATEGORY_TITLES[category] || ('🌼 ' + category.toUpperCase());
        const f1 = FLOWERS[flower % FLOWERS.length];
        let block = `╔═══════════════╗\n  ${f1} *${title}* ${f1}\n╠───────────────╣\n`;
        for (const name of list) {
            block += `║ ${FLOWERS[flower % FLOWERS.length]} *{{P}}${name}*\n`;
            flower += 1;
        }
        block += `╚═══════════════╝`;

        byCategory[category] = { title, count: list.length, text: block };
        blocks.push(block);
    }

    const footer =
        `╔══════════════════╗\n` +
        `   🌸 *PHONEPHIX BOT* 🌸\n` +
        `╠──────────────────╣\n` +
        ` 💡 {{P}}menu <category>\n` +
        ` 📢 Channel: Phonephix Pro\n` +
        ` Developer by Dvary 👑\n` +
        ` Thanks for using Phonephix Bot 🌷\n` +
        `╚══════════════════╝`;

    return {
        key: commands.length,
        total: seen.size,
        byCategory,
        full: blocks.join('\n\n') + '\n\n' + footer
    };
}

function formatUptime(sec) {
    sec = Math.floor(sec);
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return (d ? d + 'd ' : '') + `${h}h ${m}m ${s}s`;
}

function nowText() {
    try { return new Date().toLocaleString('en-US', { timeZone: TIMEZONE }); }
    catch (_) { return new Date().toLocaleString('en-US'); }
}

function makeHeader(total) {
    return (
        `╔════════◇◆◇═══════╗\n` +
        `├ 🌸 *PHONEPHIX BOT* 🌸\n` +
        `├▢👑 Owner: *${OWNER_NAME}*\n` +
        `├▢🕐 *${nowText()}*\n` +
        `├▢⏱️ Uptime: *${formatUptime(process.uptime())}*\n` +
        `├▢🔖 Version: *${VERSION}*\n` +
        `├▢📚 Commands: *${total}*\n` +
        `╚════════◇◆◇═══════╝\n\n`
    );
}

function render(text, prefix) {
    return text.replace(/\{\{P\}\}/g, () => prefix);
}

function splitLines(text, max) {
    if (text.length <= max) return [text];
    const parts = [];
    let cur = '';
    for (const line of text.split('\n')) {
        if (cur.length + line.length + 1 > max && cur) {
            parts.push(cur.trimEnd());
            cur = '';
        }
        cur += line + '\n';
    }
    if (cur.trim()) parts.push(cur.trimEnd());
    return parts;
}

function loadImage(category) {
    const key = category || 'menu';
    if (imageCache.has(key)) return imageCache.get(key);

    const dir = path.join(process.cwd(), 'public', 'lid', 'hat', 'rug', 'jar', 'dig', 'gas', 'key', 'van', 'ice', 'oil', 'rib', 'cup', 'mat', 'zoo', 'end', 'fur', 'sun', 'bit', 'gum', 'sea', 'tap', 'web', 'cat', 'yo', 'bee', 'toy', 'dot', 'fan', 'kin', 'pen', 'eye', 'net', 'jaw', 'pie', 'mop', 'nap', 'lab', 'urn', 'inn', 'images');
    const read = (name) => fs.promises.readFile(path.join(dir, name)).catch(() => null);

    const p = (async () => {
        if (category) {
            for (const ext of ['jpg', 'jpeg', 'png']) {
                const b = await read(`menu-${category}.${ext}`);
                if (b) return b;
            }
        }
        for (const name of ['menu.jpg', 'menu.jpeg', 'menu.png']) {
            const b = await read(name);
            if (b) return b;
        }
        return null;
    })();

    imageCache.set(key, p);
    return p;
}

module.exports = {
    name: 'menu',
    category: 'general',
    aliases: ['help', 'commands'],
    description: 'Display the bot command menu',
    usage: '.menu [category]',
    ownerOnly: false,
    cooldown: 0,

    async execute(ctx) {
        const { sock, from, msg } = ctx;

        const queued = typeof sock.__queueSize === 'function' ? sock.__queueSize() : 0;
        const useImage = WITH_IMAGE && queued <= BUSY_QUEUE;

        const send = (content, extra = {}) => sock.sendMessage(from, content, { quoted: msg, ...extra });

        try {
            const commands = typeof ctx.getCommands === 'function' ? ctx.getCommands() : null;
            if (!Array.isArray(commands)) {
                return send({ text: '❌ Failed to load the command menu.' });
            }

            if (!cache || cache.key !== commands.length) cache = buildCache(commands);

            const prefix = ctx.prefix || '.';
            const header = makeHeader(cache.total);
            const wanted = String((ctx.args && ctx.args[0]) || '').toLowerCase();

            let body;
            let imageKey = null;

            if (wanted && wanted !== 'all') {
                const entry = cache.byCategory[wanted];
                if (!entry) {
                    const names = Object.keys(cache.byCategory).join(', ');
                    return send({ text: `❌ Unknown category "${wanted}".\n\nAvailable: ${names}` });
                }
                body = entry.text + '\n\n_Use {{P}}menu to see everything._';
                imageKey = wanted;
            } else {
                body = cache.full;
                if (LOADING_TEXT) send({ text: LOADING_TEXT }, { noBrand: true }).catch(() => {});
            }

            const text = render(header + body, prefix);
            const image = useImage ? await loadImage(imageKey) : null;

            // optional picture first (short caption), then ONE connected menu message
            if (image) {
                await send({ image, caption: render(header, prefix).trimEnd() });
                const parts = splitLines(render(body, prefix), MAX_TEXT);
                for (const part of parts) await send({ text: part });
            } else {
                const parts = splitLines(text, MAX_TEXT);
                for (const part of parts) await send({ text: part });
            }

        } catch (error) {
            console.error('[MENU ERROR]', error && error.message ? error.message : error);
            try { await send({ text: `❌ Failed to load the menu.\n\n${error && error.message ? error.message : error}` }); } catch (_) {}
        }
    }
};
