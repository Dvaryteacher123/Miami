'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'tagcode',
    emoji: '📣',
    aliases: ['tagcountry', 'tagbycode'],
    description: '📣 Tag members whose number starts with a country code',
    usage: 'tagcode <code> [message]',
    admin: true,
    cooldown: 10,
    async run({ parts, botNums, partId, phoneOf, num, args, raw, send, reply, prefix }) {
        const code = String(args[0] || '').replace(/\D/g, '');
        if (!code) return reply(`❌ Enter a country code 📣\n\nExample: ${prefix}tagcode 255 Meeting at 8pm`);
        const msg = raw.replace(/^\s*\+?\d+\s*/, '').trim() || 'Attention please! 📢';
        const jids = parts
            .filter((p) => !botNums.includes(num(partId(p))) && phoneOf(p).startsWith(code))
            .map(partId)
            .slice(0, 150);
        if (!jids.length) return reply(`📣 No members found with code *+${code}*.`);
        return send({
            text: `📣 *+${code} MEMBERS*\n\n${msg}\n\n${jids.map((j) => `@${num(j)}`).join(' ')}`,
            mentions: jids
        });
    }
});
