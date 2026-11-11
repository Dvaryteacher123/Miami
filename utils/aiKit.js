'use strict';

/**
 * AI KIT - shared engine for the AI commands (commands/ai/*.js)
 *
 * Provider (set in .env):
 *   AI_API_KEY   key for any OpenAI-compatible service (Groq, OpenRouter, OpenAI, Gemini...)
 *   AI_API_URL   default https://api.groq.com/openai/v1
 *   AI_MODEL     default llama-3.1-8b-instant
 * Without AI_API_KEY the bot tries a free keyless service (less reliable).
 */

const MAX_REPLY = 3500;
const TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS) || 30000;
const MAX_PARALLEL = Number(process.env.AI_MAX_PARALLEL) || 4;

let active = 0;
const waiting = [];
function acquire() {
    if (active < MAX_PARALLEL) { active++; return Promise.resolve(); }
    return new Promise((res) => waiting.push(res)).then(() => { active++; });
}
function release() {
    active--;
    const next = waiting.shift();
    if (next) next();
}

async function callOpenAiCompatible(prompt, system) {
    const base = (process.env.AI_API_URL || 'https://api.groq.com/openai/v1').replace(/\/+$/, '');
    const res = await fetch(`${base}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.AI_API_KEY}`
        },
        body: JSON.stringify({
            model: process.env.AI_MODEL || 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: system },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 900
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS)
    });

    if (res.status === 401 || res.status === 403) throw new Error('The AI key is invalid. Owner: check AI_API_KEY in .env.');
    if (res.status === 429) throw new Error('The AI is busy right now. Try again in a minute.');
    if (!res.ok) throw new Error(`The AI service returned an error (${res.status}).`);

    const data = await res.json();
    const out = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!out) throw new Error('The AI returned an empty answer. Try again.');
    return String(out);
}

async function callKeyless(prompt, system) {
    const url = `https://text.pollinations.ai/${encodeURIComponent(prompt.slice(0, 1500))}` +
        `?model=openai&system=${encodeURIComponent(system.slice(0, 400))}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) throw new Error('The free AI service is not available. Owner: set AI_API_KEY in .env.');
    const out = await res.text();
    if (!out || !out.trim()) throw new Error('The AI returned an empty answer. Try again.');
    return out;
}

async function askAI(prompt, system) {
    await acquire();
    try {
        const out = process.env.AI_API_KEY
            ? await callOpenAiCompatible(prompt, system)
            : await callKeyless(prompt, system);
        return out.trim().slice(0, MAX_REPLY);
    } catch (err) {
        if (err && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
            throw new Error('The AI took too long to answer. Try again.');
        }
        if (err && /fetch failed/i.test(String(err.message))) {
            throw new Error('Could not reach the AI service. Try again later.');
        }
        throw err;
    } finally {
        release();
    }
}

/* text of the message the user replied to (text, caption...) */
function quotedText(msg) {
    try {
        const m = msg && msg.message ? msg.message : {};
        const inner = m.ephemeralMessage?.message || m.viewOnceMessage?.message || m;
        let info = null;
        for (const k of Object.keys(inner)) {
            if (inner[k] && inner[k].contextInfo && inner[k].contextInfo.quotedMessage) { info = inner[k].contextInfo; break; }
        }
        const q = info && info.quotedMessage;
        if (!q) return '';
        return String(
            q.conversation ||
            q.extendedTextMessage?.text ||
            q.imageMessage?.caption ||
            q.videoMessage?.caption ||
            q.documentMessage?.caption ||
            ''
        ).trim();
    } catch (_) { return ''; }
}

/**
 * makeAiCommand({ name, aliases, description, usage, example, title, emoji, system, build })
 *   build(text, args) -> prompt string (optional)
 */
function makeAiCommand(def) {
    return {
        name: def.name,
        category: 'ai',
        aliases: def.aliases || [],
        description: def.description,
        usage: `.${def.usage || def.name}`,
        ownerOnly: false,
        cooldown: def.cooldown === undefined ? 5 : def.cooldown,

        async execute(ctx) {
            const { sock, from, msg } = ctx;
            const prefix = ctx.prefix || '.';
            const reply = (t) => sock.sendMessage(from, { text: String(t) }, { quoted: msg });

            const args = Array.isArray(ctx.args) ? ctx.args : [];
            let text = args.join(' ').trim();
            const quoted = quotedText(msg);

            // `.cmd <input>` or reply to a message with `.cmd`
            if (!text && def.useQuoted !== false) text = quoted;

            let prompt;
            try {
                prompt = def.build ? def.build(text, args, quoted) : text;
            } catch (_) { prompt = ''; }

            if (!prompt || !String(prompt).trim()) {
                return reply(
                    `${def.emoji || '🤖'} *${def.title}*\n\n` +
                    `${def.description}\n\n` +
                    `Usage: ${prefix}${def.usage || def.name}\n` +
                    `Example: ${prefix}${def.example || def.name}\n\n` +
                    `_You can also reply to a message with ${prefix}${def.name}._`
                );
            }

            try { sock.sendPresenceUpdate && sock.sendPresenceUpdate('composing', from).catch(() => {}); } catch (_) {}

            try {
                const out = await askAI(String(prompt).slice(0, 3000), def.system);
                return reply(`${def.emoji || '🤖'} *${def.title}*\n\n${out}`);
            } catch (error) {
                return reply(`❌ ${error && error.message ? error.message : 'AI error. Try again.'}`);
            }
        }
    };
}

module.exports = { makeAiCommand, askAI, quotedText };
