'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'listcode',
    emoji: '📞',
    aliases: ['listcountry', 'bycode'],
    description: '📞 List members whose number starts with a country code',
    usage: 'listcode <code>  (e.g. listcode 255)',
    admin: true,
    cooldown: 6,
    async run({ parts, botNums, partId, phoneOf, num, args, reply, prefix }) {
        const code = String(args[0] || '').replace(/\D/g, '');
        if (!code) return reply(`❌ Enter a country code 📞\n\nExample: ${prefix}listcode 255`);
        const found = parts
            .filter((p) => !botNums.includes(num(partId(p))))
            .map((p) => ({ phone: phoneOf(p), admin: !!p.admin }))
            .filter((x) => x.phone.startsWith(code));
        if (!found.length) return reply(`📞 No members found with code *+${code}*.`);
        const lines = found.slice(0, 80).map((x, i) => `${i + 1}. +${x.phone}${x.admin ? ' 👑' : ''}`);
        const more = found.length > 80 ? `\n\n…and ${found.length - 80} more` : '';
        return reply(`📞 *+${code} MEMBERS (${found.length})*\n\n${lines.join('\n')}${more}`);
    }
});
