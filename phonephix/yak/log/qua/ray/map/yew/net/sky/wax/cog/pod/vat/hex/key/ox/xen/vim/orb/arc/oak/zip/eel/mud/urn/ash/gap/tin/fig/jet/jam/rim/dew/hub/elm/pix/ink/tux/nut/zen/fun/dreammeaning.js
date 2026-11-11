'use strict';
const MEANINGS = {
    flying: 'A desire for freedom or escaping a stressful situation.',
    falling: 'Feelings of losing control in some area of your life.',
    water: 'Reflects your emotional state at the moment.',
    teeth: 'Often linked to anxiety about appearance or communication.',
    chasing: 'Avoiding something you need to confront in real life.'
};
module.exports = {
    name: 'dreammeaning', category: 'fun', aliases: ['dream'],
    description: 'Fun (non-scientific) dream symbol meaning', usage: '.dreammeaning flying', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const key = (args?.[0] || '').toLowerCase();
        if (!MEANINGS[key]) {
            return reply(`❌ Usage: .dreammeaning <symbol>\n\nTry: ${Object.keys(MEANINGS).join(', ')}`);
        }
        return reply(`💭 *${key.toUpperCase()}*\n\n${MEANINGS[key]}\n\n_For fun only, not scientific._`);
    }
};
