'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
module.exports = defineGroup({
    name: 'birthdays',
    emoji: '🎂',
    aliases: ['upcomingbirthdays', 'bdays'],
    description: '🎂 Upcoming birthdays in this group',
    cooldown: 6,
    async run({ store, num, reply, prefix }) {
        const { gs } = await store();
        const list = Object.entries(gs.birthdays || {});
        if (!list.length) return reply(`🎂 No birthdays saved yet.\n\nMembers can use *${prefix}setbirthday DD/MM* 🎈`);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const rows = list.map(([phone, b]) => {
            let next = new Date(now.getFullYear(), b.m - 1, b.d);
            if (next < today) next = new Date(now.getFullYear() + 1, b.m - 1, b.d);
            return { phone, b, jid: b.jid || `${phone}@s.whatsapp.net`, days: Math.round((next - today) / 86400000) };
        }).sort((x, y) => x.days - y.days).slice(0, 12);
        const lines = rows.map((r) => {
            const when = r.days === 0 ? '🎉 *TODAY!* 🎂' : r.days === 1 ? 'tomorrow' : `in ${r.days} days`;
            return `🎈 @${num(r.jid)} — ${r.b.d} ${MONTHS[r.b.m - 1]} (${when})`;
        });
        return reply(`🎂 *UPCOMING BIRTHDAYS*\n\n${lines.join('\n')}`, rows.map((r) => r.jid));
    }
});
