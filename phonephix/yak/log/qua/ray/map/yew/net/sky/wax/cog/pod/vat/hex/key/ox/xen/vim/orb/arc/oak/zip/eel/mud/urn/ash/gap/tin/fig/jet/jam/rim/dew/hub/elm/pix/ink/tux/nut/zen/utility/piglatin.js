'use strict';
function toPigLatin(word) {
    const m = word.match(/^[^aeiouAEIOU]+/);
    if (!m) return word + 'way';
    const consonants = m[0];
    return word.slice(consonants.length) + consonants.toLowerCase() + 'ay';
}
module.exports = {
    name: 'piglatin', category: 'utility', aliases: [],
    description: 'Translate text to Pig Latin', usage: '.piglatin <text>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const text = (args || []).join(' ');
        if (!text) return reply('❌ Usage: .piglatin <text>');
        const out = text.split(/\s+/).map(toPigLatin).join(' ');
        return reply(`🐷 ${out}`);
    }
};
