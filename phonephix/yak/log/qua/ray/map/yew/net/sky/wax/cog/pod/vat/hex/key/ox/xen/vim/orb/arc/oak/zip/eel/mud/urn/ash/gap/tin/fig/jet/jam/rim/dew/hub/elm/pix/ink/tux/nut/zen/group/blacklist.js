'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'blacklist',
    emoji: '⛔',
    aliases: ['banlist', 'banuser'],
    description: '⛔ Blacklist a number: removed now and auto-removed whenever it rejoins',
    usage: 'blacklist @user  |  blacklist 2557xxxxxxxx',
    admin: true,
    cooldown: 4,
    async run({ sock, from, resolveTarget, store, botIsAdmin, num, reply, prefix }) {
        const t = resolveTarget();
        if (!t) return reply(`❌ Mention, reply to, or type the number ⛔\n\nExample: ${prefix}blacklist 255712345678`);
        if (t.isBot) return reply("❌ I can't blacklist myself 😄");
        if (t.isAdmin) return reply('❌ You cannot blacklist an admin.');
        const { gs, save } = await store();
        if (!Array.isArray(gs.blacklist)) gs.blacklist = [];
        if (gs.blacklist.length >= 200) return reply('❌ Blacklist is full (200) ⛔');
        const phones = [...new Set([t.phone, t.part ? num(t.part.jid || '') : ''].filter(Boolean))];
        for (const p of phones) if (!gs.blacklist.includes(p)) gs.blacklist.push(p);
        await save();
        let extra = '';
        if (t.part && botIsAdmin) {
            try { await sock.groupParticipantsUpdate(from, [t.jid], 'remove'); extra = '\n🚫 Removed from the group.'; } catch (_) { /* ignore */ }
        } else if (t.part) {
            extra = '\n⚠️ Make me an admin so I can remove them.';
        }
        return reply(`⛔ *BLACKLISTED*\n\n+${t.phone}${extra}\n\nThey will be removed automatically if they join again.`);
    }
});
