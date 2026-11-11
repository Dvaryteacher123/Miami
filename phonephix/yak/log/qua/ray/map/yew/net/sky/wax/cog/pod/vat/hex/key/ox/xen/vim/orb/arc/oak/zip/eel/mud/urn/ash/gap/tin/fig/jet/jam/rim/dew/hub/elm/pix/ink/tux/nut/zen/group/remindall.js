'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');
const { parseDuration, human } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/duration');

let counter = 0;
module.exports = defineGroup({
    name: 'remindall',
    emoji: '⏰',
    aliases: ['groupreminder', 'remindgc'],
    description: '⏰ Set a reminder that notifies the whole group later (10s - 24h)',
    usage: 'remindall 30m <message>',
    admin: true,
    cooldown: 5,
    async run({ sock, from, pool, args, raw, timers, reply, prefix }) {
        const ms = parseDuration(args[0]);
        const msg = raw.replace(/^\s*\S+\s*/, '').trim();
        if (!ms || !msg) return reply(`❌ Give a time and a message ⏰\n\nExample: ${prefix}remindall 30m Meeting starts now\n(from 10 seconds up to 24 hours)\n\n⚠️ Reminders are lost if the bot restarts.`);
        counter += 1;
        const key = `remind:${from}:${counter}`;
        const mentions = [...pool];
        const timer = setTimeout(async () => {
            timers.delete(key);
            try {
                await sock.sendMessage(from, { text: `⏰ *REMINDER*\n\n${msg.slice(0, 1500)}`, mentions });
            } catch (_) { /* bot left or disconnected */ }
        }, ms);
        if (timer.unref) timer.unref();
        timers.set(key, timer);
        return reply(`⏰ *REMINDER SET*\n\n📝 ${msg.slice(0, 200)}\n⏳ In: *${human(ms)}*\n\n⚠️ Lost if the bot restarts.`);
    }
});
