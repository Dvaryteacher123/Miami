'use strict';

module.exports = {
    name: 'add',
    category: 'group',

    aliases: ['invite'],

    description: 'Add a member to the group',
    usage: '.add 2557xxxxxxxx',

    ownerOnly: false,
    cooldown: 5,

    async execute(ctx) {

        const reply = async (text) => {
            await ctx.sock.sendMessage(
                ctx.from,
                { text: String(text) },
                { quoted: ctx.msg }
            );
        };

        try {
            if (!ctx.isGroup) {
                return reply(
                    '❌ This command can only be used in groups.'
                );
            }

            const raw =
                ctx.args?.[0];

            if (!raw) {
                return reply(
                    `❌ Usage:\n${ctx.prefix || '.'}add 2557xxxxxxxx`
                );
            }

            const phone =
                String(raw)
                    .replace(/\D/g, '');

            if (
                phone.length < 8 ||
                phone.length > 15
            ) {
                return reply(
                    '❌ Invalid phone number.'
                );
            }

            const jid =
                `${phone}@s.whatsapp.net`;

            await ctx.sock.groupParticipantsUpdate(
                ctx.from,
                [jid],
                'add'
            );

            return reply(
                `✅ Add request sent for @${phone}.`
            );

        } catch (error) {
            console.error('[ADD ERROR]', error);

            return reply(
                `❌ Failed to add member.\n\n${error.message}`
            );
        }
    }
};
