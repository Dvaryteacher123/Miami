'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');
const { parseDuration, human } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/duration');

module.exports = defineGroup({
    name: 'closetime',
    aliases: ['closefor', 'funga'],
    description: '⏱️ Close the group now and reopen it automatically after a set time',
    usage: 'closetime 30m (s, m, h)',
    admin: true,
    botAdmin: true,
    async run({ sock, from, args, reply, timers, prefix }) {
        const ms = parseDuration(args[0]);
        if (!ms) return reply(`⏱️ Usage:\n${prefix}closetime 30m\n${prefix}closetime 2h\n\n(from 10 seconds up to 24 hours)`);
        const key = `${from}`;
        if (timers.has(key)) clearTimeout(timers.get(key));
        await sock.groupSettingUpdate(from, 'announcement');
        const t = setTimeout(async () => {
            timers.delete(key);
            try {
                await sock.groupSettingUpdate(from, 'not_announcement');
                await sock.sendMessage(from, { text: '🔓 Time is up. *The group is now open.*' });
            } catch (_) { /* bot left or disconnected */ }
        }, ms);
        if (t.unref) t.unref();
        timers.set(key, t);
        return reply(`🔒 *Group closed* for ${human(ms)}.\nIt will reopen automatically.`);
    }
});
