'use strict';

const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'badwords',
    aliases: ['listbadwords'],
    description: '📃 Show banned words of this group',
    usage: 'badwords',
    emoji: '📃',
    admin: true,
    async run({ reply, store }) {
        const { gs } = await store();
        const list = gs.badwords || [];
        return reply(
            `📃 *BANNED WORDS* (${list.length})\nFilter: ${gs.antibadword ? '🟢 ON' : '🔴 OFF'}\n\n` +
            (list.length ? list.map((w, i) => `${i + 1}. ${w}`).join('\n') : '_none_')
        );
    }
});
