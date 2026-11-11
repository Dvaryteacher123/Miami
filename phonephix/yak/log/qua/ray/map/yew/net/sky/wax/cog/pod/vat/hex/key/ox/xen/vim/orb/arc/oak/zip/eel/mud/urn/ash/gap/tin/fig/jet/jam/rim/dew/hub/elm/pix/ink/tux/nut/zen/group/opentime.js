'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');
const { parseDuration, human } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/duration');

module.exports = defineGroup({
    name: 'opentime',
    aliases: ['openfor', 'fungua'],
    description: '⏱️ Open the group now and close it automatically after a set time',
    usage: 'opentime 30m (s, m, h)',
    admin: true,
    botAdmin: true,
    async run({ sock, from, args, reply, timers, prefix }) {
        const ms = parseDuration(args[0]);
        if (!ms) return reply(`⏱️ Usage:\n${prefix}opentime 30m\n${prefix}opentime 2h\n\n(from 10 seconds up to 24 hours)`);
        const key = `${from}`;
        if (timers.has(key)) clearTimeout(timers.get(key));
        await sock.groupSettingUpdate(from, 'not_announcement');
        const t = setTimeout(async () => {
            timers.delete(key);
            try {
                await sock.groupSettingUpdate(from, 'announcement');
                await sock.sendMessage(from, { text: '🔒 Time is up. *The group is now closed.*' });
            } catch (_) { /* bot left or disconnected */ }
        }, ms);
        if (t.unref) t.unref();
        timers.set(key, t);
        return reply(`🔓 *Group opened* for ${human(ms)}.\nIt will close automatically.`);
    }
});
