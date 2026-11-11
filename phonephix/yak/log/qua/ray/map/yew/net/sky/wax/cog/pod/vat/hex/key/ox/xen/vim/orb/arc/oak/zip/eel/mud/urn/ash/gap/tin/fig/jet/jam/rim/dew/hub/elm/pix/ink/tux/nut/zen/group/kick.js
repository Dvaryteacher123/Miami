'use strict';

module.exports = {
    name: 'kick',

    aliases: [
        'remove',
        'delmember'
    ],

    category: 'group',

    description: 'Remove a member from the group',

    usage: '.kick @user',

    ownerOnly: false,

    cooldown: 3,

    async execute(ctx) {

        // =====================================================
        // REPLY HELPER
        // =====================================================

        const reply = async (text, opts = {}) => {
            return ctx.sock.sendMessage(
                ctx.from,
                {
                    text: String(text),
                    ...opts
                },
                {
                    quoted: ctx.msg
                }
            );
        };


        // =====================================================
        // GROUP ONLY
        // =====================================================

        if (!ctx.isGroup) {
            return reply(
                `❌ *GROUP ONLY*\n\n` +
                `This command can only be used in groups.`
            );
        }


        // =====================================================
        // CHECK BOT
        // =====================================================

        if (!ctx.sock) {
            return reply(
                `❌ *BOT ERROR*\n\n` +
                `Bot connection is not available.`
            );
        }


        // =====================================================
        // GET TARGET FROM MENTION
        // =====================================================

        let targetJid = null;

        const mentioned = Array.isArray(
            ctx.msg?.message?.extendedTextMessage?.contextInfo?.mentionedJid
        )
            ? ctx.msg.message.extendedTextMessage.contextInfo.mentionedJid
            : [];


        if (mentioned.length > 0) {
            targetJid = mentioned[0];
        }


        // =====================================================
        // GET TARGET FROM REPLIED MESSAGE
        // =====================================================

        if (!targetJid) {

            const contextInfo =
                ctx.msg?.message?.extendedTextMessage?.contextInfo;

            const quotedParticipant =
                contextInfo?.participant;

            if (quotedParticipant) {
                targetJid = quotedParticipant;
            }
        }


        // =====================================================
        // GET TARGET FROM ARGUMENT
        // =====================================================

        if (!targetJid && ctx.args?.[0]) {

            const number = String(ctx.args[0])
                .replace(/[^0-9]/g, '');

            if (number.length >= 5) {

                targetJid =
                    `${number}@s.whatsapp.net`;
            }
        }


        // =====================================================
        // NO TARGET
        // =====================================================

        if (!targetJid) {

            const prefix =
                ctx.prefix || '.';

            return reply(

                `❌ *NO MEMBER SELECTED*\n\n` +

                `Use the command like this:\n\n` +

                `👉 *${prefix}kick @user*\n\n` +

                `Or reply to a member's message and type:\n` +

                `👉 *${prefix}kick*`
            );
        }


        // =====================================================
        // NORMALIZE JID
        // =====================================================

        targetJid = String(targetJid)
            .replace(/^whatsapp:/i, '')
            .trim();


        // =====================================================
        // GET GROUP METADATA
        // =====================================================

        let metadata;

        try {

            metadata =
                await ctx.sock.groupMetadata(ctx.from);

        } catch (error) {

            console.error(
                '[KICK GROUP METADATA ERROR]',
                error
            );

            return reply(
                `❌ *ERROR*\n\n` +
                `Failed to fetch group information.`
            );
        }


        // =====================================================
        // FIND TARGET PARTICIPANT
        // =====================================================

        const participants =
            metadata?.participants || [];

        const normalizePhone = (jid) => {

            return String(jid || '')
                .split(':')[0]
                .split('@')[0]
                .replace(/[^\d]/g, '');
        };


        const targetPhone =
            normalizePhone(targetJid);


        const targetParticipant =
            participants.find((participant) => {

                const participantJid =
                    String(
                        participant?.id ||
                        participant?.jid ||
                        ''
                    );

                if (
                    participantJid === targetJid
                ) {
                    return true;
                }

                return (
                    normalizePhone(
                        participantJid
                    ) === targetPhone
                );
            });


        // =====================================================
        // MEMBER NOT FOUND
        // =====================================================

        if (!targetParticipant) {

            return reply(
                `❌ *MEMBER NOT FOUND*\n\n` +
                `That member is not in this group.`
            );
        }


        const finalTargetJid =
            targetParticipant.id ||
            targetParticipant.jid ||
            targetJid;


        // =====================================================
        // CANNOT KICK GROUP OWNER
        // =====================================================

        if (
            targetParticipant.admin === 'superadmin'
        ) {

            return reply(
                `❌ *CANNOT KICK*\n\n` +
                `You cannot remove the Group Creator.`
            );
        }


        // =====================================================
        // CANNOT KICK ANOTHER ADMIN
        // =====================================================

        if (
            targetParticipant.admin === 'admin'
        ) {

            return reply(
                `❌ *CANNOT KICK ADMIN*\n\n` +
                `This member is a Group Admin.\n\n` +
                `⚠️ Demote them first if ` +
                `you want to remove them.`
            );
        }


        // =====================================================
        // CHECK BOT JID
        // =====================================================

        const botJids = [];

        if (ctx.sock?.user?.id) {
            botJids.push(ctx.sock.user.id);
        }

        if (ctx.sock?.user?.lid) {
            botJids.push(ctx.sock.user.lid);
        }

        if (ctx.sock?.authState?.creds?.me?.id) {
            botJids.push(
                ctx.sock.authState.creds.me.id
            );
        }

        if (ctx.sock?.authState?.creds?.me?.lid) {
            botJids.push(
                ctx.sock.authState.creds.me.lid
            );
        }


        // =====================================================
        // CHECK IF TARGET IS BOT
        // =====================================================

        const targetIsBot =
            botJids.some((jid) => {

                if (
                    String(jid) ===
                    String(finalTargetJid)
                ) {
                    return true;
                }

                return (
                    normalizePhone(jid) ===
                    normalizePhone(finalTargetJid)
                );
            });


        if (targetIsBot) {

            return reply(
                `❌ *CANNOT KICK BOT*\n\n` +
                `I cannot remove myself from the group.`
            );
        }


        // =====================================================
        // REMOVE MEMBER
        // =====================================================

        try {

            await ctx.sock.groupParticipantsUpdate(
                ctx.from,
                [finalTargetJid],
                'remove'
            );

        } catch (error) {

            console.error(
                '[KICK ERROR]',
                error
            );

            return reply(
                `❌ *KICK FAILED*\n\n` +

                `Failed to remove the member.\n\n` +

                `Make sure the bot is a *Group Admin* ` +
                `first.`
            );
        }


        // =====================================================
        // SUCCESS
        // =====================================================

        const targetPhoneDisplay =
            normalizePhone(finalTargetJid);


        return reply(

            `👢 *MEMBER REMOVED* ✅\n\n` +

            `👤 @${targetPhoneDisplay}\n\n` +

            `🚫 Removed from the group.`,

            {
                mentions: [finalTargetJid]
            }
        );
    }
};
