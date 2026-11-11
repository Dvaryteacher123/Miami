'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'report',
    aliases: ['ripoti', 'reportadmin'],
    description: '🚨 Report a problem to the admins (reply to a message or give a reason)',
    usage: 'report <reason> (or reply to a message)',
    cooldown: 10,
    async run({ ctx, send, admins, partId, num, rest, resolveTarget, reply, prefix }) {
        const quotedText = (() => {
            const q = ctx.msg?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            return q?.conversation || q?.extendedTextMessage?.text || q?.imageMessage?.caption || q?.videoMessage?.caption || '';
        })();
        const t = resolveTarget({ allowNumber: false });
        if (!rest && !t) return reply(`❌ Give a reason or reply to a message.\n\nExample: ${prefix}report sending spam`);

        const jids = admins.map(partId).filter(Boolean);
        const mentions = t ? [...jids, t.jid] : jids;
        const text =
            `🚨 *REPORT TO ADMINS*\n\n` +
            `From: @${num(ctx.senderJid || ctx.senderPhone)}\n` +
            (t ? `About: @${num(t.jid)}\n` : '') +
            (rest ? `Reason: ${rest}\n` : '') +
            (quotedText ? `Message: "${String(quotedText).slice(0, 200)}"\n` : '') +
            `\n${jids.map((j) => `@${num(j)}`).join(' ')}`;
        const withSender = ctx.senderJid ? [...mentions, ctx.senderJid] : mentions;
        return send({ text, mentions: withSender });
    }
});
