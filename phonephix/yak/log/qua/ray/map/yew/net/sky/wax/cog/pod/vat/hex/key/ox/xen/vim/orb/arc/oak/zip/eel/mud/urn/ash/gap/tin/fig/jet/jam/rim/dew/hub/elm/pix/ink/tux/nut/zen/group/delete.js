'use strict';

module.exports = {
    name: 'delete',
    category: 'group',
    aliases: ['del'],
    description: 'Delete a replied message',
    usage: '.delete',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const reply = async (text) => {
            return ctx.sock.sendMessage(
                ctx.from,
                { text: String(text) },
                { quoted: ctx.msg }
            );
        };

        try {
            if (!ctx.isGroup) {
                return reply(
                    '❌ This command can only be used in a group.'
                );
            }

            // Get quoted message
            const quoted =
                ctx.msg?.message
                    ?.extendedTextMessage
                    ?.contextInfo
                    ?.quotedMessage;

            const quotedKey =
                ctx.msg?.message
                    ?.extendedTextMessage
                    ?.contextInfo
                    ?.stanzaId;

            const quotedParticipant =
                ctx.msg?.message
                    ?.extendedTextMessage
                    ?.contextInfo
                    ?.participant;

            if (!quoted || !quotedKey) {
                return reply(
                    `❌ *Reply to a message first.*\n\n` +
                    `Example:\n` +
                    `Reply to a message with *${ctx.prefix || '.'}delete*`
                );
            }

            // Reconstruct the quoted message key
            const key = {
                remoteJid: ctx.from,
                fromMe: false,
                id: quotedKey
            };

            if (quotedParticipant) {
                key.participant = quotedParticipant;
            }

            // Delete the replied message
            await ctx.sock.sendMessage(
                ctx.from,
                {
                    delete: key
                }
            );

        } catch (error) {
            console.error('[DELETE ERROR]', error);

            return reply(
                `❌ *Delete Failed*\n\n` +
                `${error?.message || error}`
            );
        }
    }
};
