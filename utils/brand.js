'use strict';

/**
 * BRANDING - "View Channel" and "View Group" buttons under every command reply.
 *
 * The buttons are real WhatsApp buttons (not a pasted link): people tap them and
 * WhatsApp opens your channel / group. A small footer shows the time and version.
 *
 * Which messages get the buttons?
 *   - replies that quote the user's message (every command reply), and
 *   - messages that pass { brand: true } in the send options (e.g. welcome).
 *   Only text messages and images (with caption) are decorated. Audio, video,
 *   stickers, reactions, deletes etc. are sent exactly as before.
 *   A message can opt out with { noBrand: true }.
 *
 * .env (all optional):
 *   BRAND_BUTTONS=false          turn all of this off
 *   BRAND_CHANNEL_URL / BRAND_GROUP_URL / BRAND_VERSION
 *   BRAND_CHANNEL_LABEL / BRAND_GROUP_LABEL   (button texts)
 *   BRAND_FORWARD_HEADER=true    also show WhatsApp's own "Forwarded from <channel>"
 *                                header (needs the channel to be reachable)
 */

const baileys = require('../bot/baileys');

const CHANNEL_URL = () => process.env.BRAND_CHANNEL_URL ||
    'https://whatsapp.com/channel/0029VbCRC9b5fM5cruU8PF2M';
const CHANNEL_NAME = () => process.env.BRAND_CHANNEL_NAME || '꧁༒☬Phonephix Pro☬༒꧂';
const GROUP_URL = () => process.env.BRAND_GROUP_URL ||
    'https://chat.whatsapp.com/GhigFoMJ1hY1B1HGtBl3kz?s=sh&p=a&mlu=4&ilr=4';
const VERSION = () => process.env.BRAND_VERSION || 'v1.002';
const CHANNEL_LABEL = () => process.env.BRAND_CHANNEL_LABEL || '📢 View Channel';
const GROUP_LABEL = () => process.env.BRAND_GROUP_LABEL || '👥 View Group';

const enabled = () => String(process.env.BRAND_BUTTONS || 'true').toLowerCase() !== 'false';

const MAX_BODY = 3500; // longer texts are sent plain (safer than risking a rejected message)

/* ---------- footer: time + version ---------- */

function footerText() {
    const tz = process.env.BOT_TIMEZONE || 'Africa/Dar_es_Salaam';
    let time;
    try {
        time = new Intl.DateTimeFormat('en-GB', {
            timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false
        }).format(new Date());
    } catch (_) {
        time = new Date().toISOString().slice(11, 16);
    }
    return `🕒 ${time} • ${VERSION()}`;
}

/* ---------- optional "Forwarded from channel" header ---------- */

let channelJid = null;
let channelTried = 0;

async function getChannelJid(sock) {
    if (channelJid) return channelJid;
    if (Date.now() - channelTried < 10 * 60 * 1000) return null;
    channelTried = Date.now();
    try {
        const code = (CHANNEL_URL().match(/channel\/([A-Za-z0-9_-]+)/) || [])[1];
        if (!code || typeof sock.newsletterMetadata !== 'function') return null;
        const meta = await Promise.race([
            sock.newsletterMetadata('invite', code),
            new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000))
        ]);
        if (meta && meta.id) channelJid = String(meta.id);
    } catch (_) {}
    return channelJid;
}

/* ---------- the interactive message ---------- */

/**
 * Sends a message with buttons. Returns the sent message ({ key, message }).
 *   body, footer, image ({url}|Buffer), buttons: [{ name, params }], mentions, quoted
 */
async function relayInteractive(sock, jid, { body, footer, image, buttons, mentions = [], quoted, forward = false }) {
    const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = baileys.get();
    const IM = proto.Message.InteractiveMessage;

    let header = IM.Header.create({ title: '', subtitle: '', hasMediaAttachment: false });

    if (image) {
        const media = await prepareWAMessageMedia({ image }, { upload: sock.waUploadToServer });
        header = IM.Header.create({ hasMediaAttachment: true, ...media });
    }

    const contextInfo = {};
    if (mentions.length) contextInfo.mentionedJid = mentions;

    if (forward) {
        const nj = await getChannelJid(sock);
        if (nj) {
            contextInfo.isForwarded = true;
            contextInfo.forwardingScore = 1;
            contextInfo.forwardedNewsletterMessageInfo = {
                newsletterJid: nj,
                newsletterName: CHANNEL_NAME(),
                serverMessageId: 100
            };
        }
    }

    const content = {
        viewOnceMessage: {
            message: {
                messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                interactiveMessage: IM.create({
                    body: IM.Body.create({ text: body }),
                    footer: IM.Footer.create({ text: footer || '' }),
                    header,
                    contextInfo,
                    nativeFlowMessage: IM.NativeFlowMessage.create({
                        buttons: buttons.map((b) => ({
                            name: b.name,
                            buttonParamsJson: JSON.stringify(b.params)
                        }))
                    })
                })
            }
        }
    };

    const waMsg = generateWAMessageFromContent(jid, content, {
        userJid: sock.user?.id,
        quoted
    });

    const additionalNodes = [
        {
            tag: 'biz',
            attrs: {},
            content: [{
                tag: 'interactive',
                attrs: { type: 'native_flow', v: '1' },
                content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }]
            }]
        }
    ];
    // private chats need this extra node for the buttons to show
    if (!String(jid).endsWith('@g.us')) {
        additionalNodes.push({ tag: 'bot', attrs: { biz_bot: '1' } });
    }

    await sock.relayMessage(jid, waMsg.message, { messageId: waMsg.key.id, additionalNodes });

    return waMsg;
}

const urlButton = (label, url) => ({
    name: 'cta_url',
    params: { display_text: label, url, merchant_url: url }
});

function brandButtons() {
    return [urlButton(CHANNEL_LABEL(), CHANNEL_URL()), urlButton(GROUP_LABEL(), GROUP_URL())];
}

/* ---------- decide + send ---------- */

const PLAIN_KEYS = new Set(['text', 'mentions', 'image', 'caption', 'mimetype', 'jpegThumbnail']);

function brandable(jid, content, options) {
    if (!enabled() || !content || typeof content !== 'object') return false;
    if (options && options.noBrand) return false;
    if (!(options && (options.quoted || options.brand === true))) return false;

    const j = String(jid || '');
    if (!j || j.endsWith('@newsletter') || j.includes('broadcast')) return false;

    for (const k of Object.keys(content)) {
        if (!PLAIN_KEYS.has(k)) return false; // react, delete, audio, video, poll, buttons ...
    }

    if (typeof content.text === 'string') {
        const t = content.text.trim();
        return t.length > 0 && t.length <= MAX_BODY && !content.image;
    }

    if (content.image) {
        const cap = String(content.caption || '').trim();
        return cap.length > 0 && cap.length <= MAX_BODY;
    }

    return false;
}

/**
 * Wraps one send. `base` is the original sock.sendMessage.
 */
async function send(sock, base, jid, content, options) {
    const { noBrand, brand, ...opts } = options || {};

    if (!brandable(jid, content, options) || typeof sock.relayMessage !== 'function') {
        return base(jid, content, opts);
    }

    try {
        const isImage = !!content.image;
        const waMsg = await relayInteractive(sock, jid, {
            body: isImage ? String(content.caption) : String(content.text),
            footer: footerText(),
            image: isImage ? content.image : undefined,
            buttons: brandButtons(),
            mentions: Array.isArray(content.mentions) ? content.mentions : [],
            quoted: opts && opts.quoted,
            forward: String(process.env.BRAND_FORWARD_HEADER || 'false').toLowerCase() === 'true'
        });
        return waMsg;
    } catch (err) {
        // never lose the message: fall back to the normal way
        try { require('./logger').warn(`[brand] buttons failed, sending plain: ${err.message}`); } catch (_) {}
        return base(jid, content, opts);
    }
}

module.exports = { send, relayInteractive, brandButtons, urlButton, footerText, enabled };
