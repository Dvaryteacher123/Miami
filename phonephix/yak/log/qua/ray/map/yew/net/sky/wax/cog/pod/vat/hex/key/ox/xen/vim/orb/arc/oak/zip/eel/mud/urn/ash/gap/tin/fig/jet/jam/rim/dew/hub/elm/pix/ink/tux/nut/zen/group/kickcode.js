'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'kickcode',
    emoji: '🌍',
    aliases: ['removecode', 'kickcountry'],
    description: '🌍 Remove non-admin members whose number starts with a country code',
    usage: 'kickcode <code> confirm',
    admin: true,
    botAdmin: true,
    cooldown: 15,
    async run({ sock, from, parts, args, isAdminPart, botNums, partId, phoneOf, num, reply, sleep, prefix }) {
        const code = String(args[0] || '').replace(/\D/g, '');
        if (!code) return reply(`❌ Enter a country code 🌍\n\nExample: ${prefix}kickcode 212 confirm`);
        const targets = parts.filter((p) => !isAdminPart(p) && !botNums.includes(num(partId(p))) && phoneOf(p).startsWith(code));
        if (!targets.length) return reply(`✅ No non-admin members found with code *+${code}*.`);
        if (String(args[1] || '').toLowerCase() !== 'confirm') {
            return reply(`⚠️ *${targets.length}* member(s) with code *+${code}* would be removed.\n\nTo continue, send:\n👉 *${prefix}kickcode ${code} confirm*`);
        }
        await reply(`🚫 Removing *${targets.length}* member(s) with code *+${code}*...`);
        let done = 0;
        for (let i = 0; i < targets.length; i += 5) {
            const batch = targets.slice(i, i + 5).map(partId);
            try {
                await sock.groupParticipantsUpdate(from, batch, 'remove');
                done += batch.length;
            } catch (_) { /* skip failed batch */ }
            await sleep(1500);
        }
        return reply(`✅ Removed *${done}/${targets.length}* member(s) with code *+${code}* 🌍`);
    }
});
