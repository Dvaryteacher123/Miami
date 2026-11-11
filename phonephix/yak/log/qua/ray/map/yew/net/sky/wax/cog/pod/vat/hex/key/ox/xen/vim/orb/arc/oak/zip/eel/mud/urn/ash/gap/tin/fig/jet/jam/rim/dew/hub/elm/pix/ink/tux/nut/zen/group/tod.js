'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

const TRUTHS = [
    'What is the most embarrassing thing you have ever done? 😳',
    'What is your biggest fear? 😱',
    'Who was your first crush? 💘',
    'What is a secret talent nobody here knows about? 🎭',
    'What is the last lie you told? 🤥',
    'What is the worst gift you ever received? 🎁',
    'Which member of this group do you talk to the most? 💬',
    'What is your most used emoji and why? 😂',
    'What is one habit you wish you could quit? 🚫',
    'What is the silliest thing you are afraid of? 🕷️'
];
const DARES = [
    'Send a voice note singing your favourite song 🎤',
    'Change your WhatsApp status to "I love this group" for 1 hour 💚',
    'Send the 5th photo in your gallery (if it is safe!) 📸',
    'Say something nice about every admin 🛡️',
    'Send a voice note doing your best animal sound 🐒',
    'Type with your eyes closed and send the result ✍️',
    'Tell the group your most-played song this week 🎧',
    'Do 10 push-ups and send a "done" message 💪',
    'Speak only in emojis for the next 10 minutes 🤐',
    'Send a selfie making a funny face 🤪'
];
module.exports = defineGroup({
    name: 'tod',
    emoji: '🎭',
    aliases: ['truthordare', 'td'],
    description: '🎭 Truth or dare for you, a mentioned member, or a random one',
    usage: 'tod [truth|dare] [@user]',
    cooldown: 4,
    async run({ resolveTarget, pool, pick, num, args, reply }) {
        const t = resolveTarget({ allowNumber: false });
        const target = t ? t.jid : pick(pool);
        if (!target) return reply('❌ No members found 😅');
        const mode = String(args[0] || '').toLowerCase();
        const kind = mode === 'truth' || mode === 'dare' ? mode : pick(['truth', 'dare']);
        const text = kind === 'truth' ? `🤫 *TRUTH*\n${pick(TRUTHS)}` : `🔥 *DARE*\n${pick(DARES)}`;
        return reply(`🎭 *TRUTH OR DARE*\n\n@${num(target)}, it's your turn! 👀\n\n${text}`, [target]);
    }
});
