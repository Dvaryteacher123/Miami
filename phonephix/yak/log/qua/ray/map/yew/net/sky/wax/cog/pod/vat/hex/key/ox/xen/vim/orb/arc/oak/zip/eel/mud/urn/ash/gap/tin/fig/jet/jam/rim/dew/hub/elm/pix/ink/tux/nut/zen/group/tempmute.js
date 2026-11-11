'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');
const Setting = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../database/models/Setting');
const { parseDuration, human } = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/duration');

module.exports = defineGroup({
    name: 'tempmute',
    emoji: '⏱️',
    aliases: ['mutefor', 'timedmute'],
    description: '⏱️ Mute a member for a limited time (10s - 24h)',
    usage: 'tempmute @user 30m',
    admin: true,
    cooldown: 4,
    async run({ ctx, sock, from, args, resolveTarget, store, timers, num, reply, prefix }) {
        const t = resolveTarget({ allowNumber: false });
        const dur = args.find((a) => /^\d+\s*[smh]?$/i.test(a));
        const ms = parseDuration(dur);
        if (!t || !ms) return reply(`❌ Mention or reply to a member and give a time ⏱️\n\nExample: ${prefix}tempmute @user 30m\n(from 10 seconds up to 24 hours)`);
        if (t.isBot) return reply("❌ I can't mute myself 😄");
        if (t.isAdmin) return reply('❌ You cannot mute an admin.');
        if (!t.part) return reply('❌ That person is not in this group.');

        const clean = String(t.jid).split(':')[0];
        const { gs, save } = await store();
        if (!Array.isArray(gs.mutedUsers)) gs.mutedUsers = [];
        if (!gs.mutedUsers.includes(clean)) gs.mutedUsers.push(clean);
        await save();

        const key = `mute:${from}:${t.phone}`;
        if (timers.has(key)) clearTimeout(timers.get(key));
        const timer = setTimeout(async () => {
            timers.delete(key);
            try {
                const settings = await Setting.getOrCreate(ctx.sessionId, ctx.userId);
                const g = settings.metadata && settings.metadata.groups && settings.metadata.groups[from];
                if (g && Array.isArray(g.mutedUsers)) {
                    g.mutedUsers = g.mutedUsers.filter((j) => j !== clean);
                    settings.markModified('metadata');
                    await settings.save();
                }
                await sock.sendMessage(from, { text: `🔊 @${num(clean)} is unmuted now. Welcome back! 🎉`, mentions: [clean] });
            } catch (_) { /* bot left or disconnected */ }
        }, ms);
        if (timer.unref) timer.unref();
        timers.set(key, timer);

        return reply(`🔇 *TEMP MUTED* ⏱️\n\n@${num(clean)} is muted for *${human(ms)}*.\nTheir messages will be deleted until then.`, [clean]);
    }
});
