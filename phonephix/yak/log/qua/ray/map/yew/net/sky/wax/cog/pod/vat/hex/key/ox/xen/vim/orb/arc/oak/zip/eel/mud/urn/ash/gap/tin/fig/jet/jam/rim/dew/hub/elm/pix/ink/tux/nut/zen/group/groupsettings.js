'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

const yn = (v) => (v ? '✅ ON' : '❌ OFF');

module.exports = defineGroup({
    name: 'groupsettings',
    aliases: ['gcsettings', 'gcstatus'],
    description: '⚙️ Show the status of all group settings',
    cooldown: 5,
    async run({ meta, store, reply }) {
        const { settings, gs } = await store();
        const eph = Number(meta.ephemeralDuration) || 0;
        const ephText = !eph ? 'OFF' : eph >= 7776000 ? '90d' : eph >= 604800 ? '7d' : '24h';
        const muted = Array.isArray(gs.mutedUsers) ? gs.mutedUsers.length : 0;
        return reply(
            `⚙️ *SETTINGS - ${meta.subject}*\n\n` +
            `💬 Who can send: ${meta.announce ? 'Admins only 🔒' : 'Everyone 🔓'}\n` +
            `✏️ Edit group info: ${meta.restrict ? 'Admins only' : 'Everyone'}\n` +
            `➕ Add members: ${meta.memberAddMode === false ? 'Admins only' : 'Everyone'}\n` +
            `🛂 Join approval: ${yn(meta.joinApprovalMode)}\n` +
            `⏳ Disappearing messages: ${ephText}\n\n` +
            `🔗 Antilink: ${yn(gs.antilink === true)}\n` +
            `🏷️ Antimention: ${yn(gs.antimention === true)}\n` +
            `👋 Welcome: ${yn(gs.welcome === true)}\n` +
            `🚪 Goodbye: ${yn(gs.goodbye === true)}\n` +
            `🔇 Muted members: ${muted}\n` +
            `⚠️ Warn limit: ${Number(gs.warnLimit) || Number(process.env.WARN_LIMIT) || 3}\n` +
            `📜 Rules: ${gs.rules ? 'Set' : 'Not set'}`
        );
    }
});
