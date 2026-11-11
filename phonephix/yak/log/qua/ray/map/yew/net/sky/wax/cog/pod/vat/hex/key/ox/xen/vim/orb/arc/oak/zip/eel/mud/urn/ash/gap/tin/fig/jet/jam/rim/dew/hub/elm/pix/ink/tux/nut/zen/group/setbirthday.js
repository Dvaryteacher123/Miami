'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'setbirthday',
    emoji: '🎈',
    aliases: ['mybirthday', 'setbday'],
    description: '🎈 Save your birthday in this group (DD/MM)',
    usage: 'setbirthday 25/12  |  setbirthday remove',
    cooldown: 4,
    async run({ store, senderPart, phoneOf, meJid, num, args, reply, prefix }) {
        const key = senderPart ? phoneOf(senderPart) : num(meJid);
        if (!key) return reply('❌ Could not identify you 😅');
        const { gs, save } = await store();
        if (!gs.birthdays || typeof gs.birthdays !== 'object') gs.birthdays = {};
        const arg = String(args[0] || '').toLowerCase();
        if (arg === 'remove' || arg === 'off') {
            delete gs.birthdays[key];
            await save();
            return reply('🗑️ Your birthday was removed.');
        }
        const m = arg.match(/^(\d{1,2})[\/\-.](\d{1,2})$/);
        if (!m) return reply(`❌ Use the format DD/MM 🎈\n\nExample: ${prefix}setbirthday 25/12`);
        const d = Number(m[1]);
        const mo = Number(m[2]);
        const days = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (mo < 1 || mo > 12 || d < 1 || d > days[mo - 1]) return reply('❌ That date is not valid 📅');
        gs.birthdays[key] = { d, m: mo, jid: meJid };
        await save();
        return reply(`🎈 Birthday saved: *${String(d).padStart(2, '0')}/${String(mo).padStart(2, '0')}* 🎂\n\nUse *${prefix}birthdays* to see everyone's.`);
    }
});
