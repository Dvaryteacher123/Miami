'use strict';

const EMOJIS = ['🔥', '💎', '⚡', '👑', '🌟', '🚀', '💫', '🦅', '🎯', '💥'];

module.exports = {
    name: 'tagall',
    category: 'group',
    aliases: ['everyone', 'all', 'mentionall'],
    description: 'Mention all group members (vertical list)',
    usage: '.tagall [message]',
    emoji: '📢',
    ownerOnly: false,
    cooldown: 5,

    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (text) => sock.sendMessage(from, { text: String(text) }, { quoted: msg });

        try {
            if (!ctx.isGroup) return reply('❌ This command can only be used in groups.');

            const metadata = await sock.groupMetadata(from);
            const participants = metadata?.participants || [];
            if (!participants.length) return reply('❌ No group members found.');

            const ids = participants.map((m) => m && m.id).filter(Boolean);
            const note = ctx.args?.length ? ctx.args.join(' ') : 'Attention everyone!';
            const group = metadata.subject || 'Group';

            const CHUNK = 60; // many members -> several messages, so none gets too long
            for (let i = 0; i < ids.length; i += CHUNK) {
                const part = ids.slice(i, i + CHUNK);

                const lines = part.map((jid, k) => {
                    const user = String(jid).split(':')[0].split('@')[0];
                    return `${EMOJIS[(i + k) % EMOJIS.length]} @${user}`;
                });

                const head =
                    `╭━━━〔 📢 *TAG ALL* 〕━━━╮\n` +
                    `┃ 👥 *${group}*\n` +
                    `┃ 👤 Members: *${ids.length}*\n` +
                    `┃ 💬 ${note}\n` +
                    `╰━━━━━━━━━━━━━━━━╯\n\n`;

                const foot = `\n\n⚡ _PhonephixBot_`;

                await sock.sendMessage(
                    from,
                    {
                        text: (i === 0 ? head : `📢 *TAG ALL* (${Math.floor(i / CHUNK) + 1})\n\n`) +
                              lines.join('\n') + foot,
                        mentions: part
                    },
                    i === 0 ? { quoted: msg } : {}
                );
            }
        } catch (error) {
            console.error('[TAGALL ERROR]', error);
            return reply(`❌ Failed to tag members.\n\n${error.message}`);
        }
    }
};
