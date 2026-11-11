'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

const DEFAULT_LIMIT = Number(process.env.WARN_LIMIT) || 3;

module.exports = defineGroup({
    name: 'warnings',
    aliases: ['warnlist', 'onyo'],
    description: '⚠️ View warnings for the group or one member',
    usage: 'warnings [@user]',
    async run({ resolveTarget, store, reply, num }) {
        const { gs } = await store();
        const limit = Number(gs.warnLimit) || DEFAULT_LIMIT;
        const warns = gs.warns || {};
        const t = resolveTarget({ allowNumber: false });

        if (t) {
            return reply(`⚠️ @${num(t.jid)}: *${Number(warns[t.phone]) || 0}/${limit}*`, [t.jid]);
        }

        const entries = Object.entries(warns).filter(([, c]) => Number(c) > 0);
        if (!entries.length) return reply('✅ Nobody has warnings in this group.');
        const jids = entries.map(([p]) => `${p}@s.whatsapp.net`);
        const lines = entries.map(([p, c]) => `• @${p}: ${c}/${limit}`);
        return reply(`⚠️ *GROUP WARNINGS*\n\n${lines.join('\n')}`, jids);
    }
});
