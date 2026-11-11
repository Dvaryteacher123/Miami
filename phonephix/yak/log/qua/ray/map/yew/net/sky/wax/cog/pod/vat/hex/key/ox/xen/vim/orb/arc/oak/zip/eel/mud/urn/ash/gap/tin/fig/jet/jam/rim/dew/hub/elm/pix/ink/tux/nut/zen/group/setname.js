'use strict';

module.exports = {
    name: 'setname',
    category: 'group',
    aliases: ['groupname'],
    description: 'Change group subject/name',
    usage: '.setname New Group Name',
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
                return reply('❌ This command can only be used in groups.');
            }

            const name = Array.isArray(ctx.args)
                ? ctx.args.join(' ').trim()
                : '';

            if (!name) {
                return reply(
                    '❌ Enter the new group name.\n\n' +
                    'Example:\n' +
                    '`.setname PHONEPHIX FAMILY`'
                );
            }

            if (name.length > 100) {
                return reply(
                    '❌ The group name is too long.\n' +
                    'Please use 100 characters or fewer.'
                );
            }

            await ctx.sock.groupUpdateSubject(
                ctx.from,
                name
            );

            return reply(
                `✅ *GROUP NAME UPDATED*\n\n` +
                `📛 New name: *${name}*`
            );

        } catch (error) {
            console.error('[SETNAME ERROR]', error);

            return reply(
                `❌ Failed to change the group name.\n\n${error?.message || error}`
            );
        }
    }
};
